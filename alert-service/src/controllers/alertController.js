const pool = require("../config/db");
const axios = require("axios");
ORION_HOST = process.env.ORION_HOST || "http://orion:1026";

// Hàm phụ trợ: Xóa cảnh báo trên Orion (Để bản đồ mất chấm đỏ)
const deleteFromOrion = async (stationName) => {
  const cleanName = stationName.replace(/[^a-zA-Z0-9]/g, "_");
  const entityId = `urn:ngsi-ld:DisasterWarning:${cleanName}`;
  const orionUrl = `${ORION_HOST}/ngsi-ld/v1/entities/${entityId}`;

  try {
    await axios.delete(orionUrl);
    console.log(`🗑️ Đã gỡ cảnh báo trên Orion cho trạm: ${stationName}`);
  } catch (e) {
    if (e.response && e.response.status !== 404) {
      console.error("❌ Lỗi xóa Orion:", e.message);
    }
  }
};

const pushToOrion = async (alertData) => {
  const orionUrl = `${ORION_HOST}/ngsi-ld/v1/entities`;
  const cleanName = alertData.station_name.replace(/[^a-zA-Z0-9]/g, "_");
  const entityId = `urn:ngsi-ld:DisasterWarning:${cleanName}`;

  const entity = {
    id: entityId,
    type: "DisasterWarning",
    alertType: { type: "Property", value: alertData.station_name },
    severity: { type: "Property", value: alertData.alert_level },
    description: { type: "Property", value: alertData.description },
    alertDate: { type: "Property", value: new Date().toISOString() },
    estimatedToa: { type: "Property", value: alertData.estimated_toa_hours },
    rain24h: { type: "Property", value: alertData.rain_24h },
    analysisData: { type: "Property", value: alertData.context_data },
    "@context": ["https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context.jsonld"],
  };

  try {
    await axios.post(orionUrl, entity, {
      headers: { "Content-Type": "application/ld+json" },
    });
    console.log("✅ Đã phát broadcast lên Orion");
  } catch (e) {
    if (
      e.response &&
      (e.response.status === 422 || e.response.status === 409)
    ) {
      try {
        await axios.delete(`${orionUrl}/${entityId}`);
        await axios.post(orionUrl, entity, {
          headers: { "Content-Type": "application/ld+json" },
        });
        console.log("♻️ Đã cập nhật broadcast trên Orion");
      } catch (delErr) {
        console.error("❌ Lỗi cập nhật Orion:", delErr.message);
      }
    } else {
      console.error("❌ Lỗi đẩy Orion:", e.message);
    }
  }
};

// --- API CONTROLLERS ---

// 1. NHẬN CẢNH BÁO TỪ PYTHON
const receiveAlert = async (req, res) => {
  const {
    station_name,
    risk_type,
    level,
    rain_value,
    description,
    estimated_toa_hours,
    rain_24h,
    flood_score,
    landslide_score,
    context_data,
  } = req.body;

  const fullContextData = { ...context_data, flood_score, landslide_score };

  try {
    // TRƯỜNG HỢP 1: MỨC AN TOÀN (LOW) -> GỠ BỎ CẢNH BÁO
    if (level === "LOW") {
      console.log(`✅ Trạm ${station_name} đã an toàn. Đang gỡ bỏ cảnh báo...`);
      await pool.query("DELETE FROM active_alerts WHERE station_name = $1", [
        station_name,
      ]);
      // 👇 QUAN TRỌNG: Lưu kết quả xóa vào biến deleteResult
      const deleteResult = await pool.query(
        "DELETE FROM alert_archive WHERE station_name = $1",
        [station_name]
      );
      await deleteFromOrion(station_name);
      // deleteResult.rowCount > 0 nghĩa là TRƯỚC ĐÓ CÓ CẢNH BÁO trong bảng
      if (deleteResult.rowCount > 0) {
        console.log(
          `✅ Trạm ${station_name} vừa hết nguy hiểm. Bắn tin gỡ bỏ...`
        );

        if (req.io) {
          console.log(`📡 Emit Socket: alert:resolved -> ${station_name}`);
          req.io.emit("alert:resolved", {
            station_name: station_name,
            status: "SAFE",
            message: "Khu vực đã trở lại bình thường.",
          });
        }
        return res.json({ message: "Đã gỡ bỏ cảnh báo và thông báo cho dân." });
      } else {
        // Nếu rowCount == 0, nghĩa là trạm này vốn dĩ đã an toàn rồi
        // -> KHÔNG BẮN SOCKET NỮA để tránh spam Frontend
        // console.log(`Trạm ${station_name} vẫn an toàn, không cần báo.`);
        return res.json({
          message: "Trạng thái bình thường (Không có hành động).",
        });
      }
    }
    // 1. KIỂM TRA TRÙNG LẶP
    const checkDuplicateQuery = `
            SELECT id, alert_level, rain_value FROM active_alerts
            WHERE station_name = $1 AND risk_type = $2
            AND status IN ('PENDING', 'APPROVED')
            AND created_at >= NOW() - INTERVAL '2 HOURS'
        `;
    const existing = await pool.query(checkDuplicateQuery, [
      station_name,
      risk_type,
    ]);

    // 2. XỬ LÝ TRÙNG LẶP (CẬP NHẬT)
    if (existing.rows.length > 0) {
      const oldAlert = existing.rows[0];

      // A. Mức độ nguy hiểm TĂNG (VD: MEDIUM -> HIGH, HIGH -> CRITICAL)
      if (level !== oldAlert.alert_level) {
        const updateQuery = `
                    UPDATE active_alerts
                    SET alert_level = $1, rain_value = $2, description = $3,
                    estimated_toa_hours = $4, rain_24h = $5, context_data = $6,
                    created_at = NOW(), status = 'PENDING'
                    WHERE id = $7
                `;
        await pool.query(updateQuery, [
          level,
          rain_value,
          description,
          estimated_toa_hours,
          rain_24h,
          JSON.stringify(fullContextData),
          oldAlert.id,
        ]);
        return res.json({
          message: "Đã nâng cấp mức độ cảnh báo cũ (Level Up).",
        });
      }

      // B. Mức độ giữ nguyên -> Chỉ cập nhật số liệu
      const updateRainQuery = `
                UPDATE active_alerts
                SET rain_value = $1, estimated_toa_hours = $2, rain_24h = $3, context_data = $4
                WHERE id = $5
            `;
      await pool.query(updateRainQuery, [
        rain_value,
        estimated_toa_hours,
        rain_24h,
        JSON.stringify(fullContextData),
        oldAlert.id,
      ]);
      return res.json({ message: "Cập nhật số liệu mới." });
    }

    // 3. TẠO CẢNH BÁO MỚI (Luôn là PENDING để Manager duyệt)
    const insertQuery = `
            INSERT INTO active_alerts
            (station_name, risk_type, alert_level, rain_value, description, estimated_toa_hours, status, rain_24h, context_data)
            VALUES ($1, $2, $3, $4, $5, $6, 'PENDING', $7, $8) RETURNING *;
        `;

    const newAlertRes = await pool.query(insertQuery, [
      station_name,
      risk_type,
      level,
      rain_value,
      description,
      estimated_toa_hours,
      rain_24h,
      JSON.stringify(fullContextData),
    ]);
    const newAlert = newAlertRes.rows[0];
    if (status === "PENDING") {
      console.log(`📡 Emit Socket: Admin có việc làm mới (${station_name})`);
      req.io.emit("alert:new_pending", newAlert);
    }

    res.json({ message: "Đã tiếp nhận cảnh báo mới, chờ duyệt." });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Lỗi lưu DB: " + e.message });
  }
};

// 2. LẤY DANH SÁCH CẦN DUYỆT (Cho Manager)
const getPendingAlerts = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM active_alerts WHERE status = 'PENDING' ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Lỗi Server" });
  }
};

// 3. MANAGER DUYỆT (Approve)
const approveAlert = async (req, res) => {
  const { id } = req.params;
  const { managerName, status } = req.body; // status: 'APPROVED' hoặc 'REJECTED'

  if (!["APPROVED", "REJECTED"].includes(status)) {
    return res
      .status(400)
      .json({ message: "Trạng thái không hợp lệ (Chỉ APPROVED/REJECTED)" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // B1: Lấy thông tin từ bảng NÓNG
    const resActive = await client.query(
      "SELECT * FROM active_alerts WHERE id = $1",
      [id]
    );
    if (resActive.rows.length === 0)
      throw new Error("Cảnh báo không tồn tại hoặc đã được xử lý");
    const alert = resActive.rows[0];

    // B2: Chuyển sang Archive (Lưu trữ cả APPROVED và REJECTED)
    const insertArchive = `
            INSERT INTO alert_archive
            (
                station_name, risk_type, alert_level, rain_value, description,
                estimated_toa_hours, approved_by, original_created_at, status,
                rain_24h, context_data
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        `;

    await client.query(insertArchive, [
      alert.station_name,
      alert.risk_type,
      alert.alert_level,
      alert.rain_value,
      alert.description,
      alert.estimated_toa_hours,
      managerName,
      alert.created_at,
      status, // Lưu trạng thái động (APPROVED/REJECTED)
      alert.rain_24h,
      JSON.stringify(alert.context_data),
    ]);

    // B3: Xóa khỏi bảng NÓNG
    await client.query("DELETE FROM active_alerts WHERE id = $1", [id]);

    // B4: Xử lý nghiệp vụ theo trạng thái
    if (status === "APPROVED") {
      // Chỉ đẩy lên Orion và thông báo dân khi ĐƯỢC DUYỆT
      await pushToOrion(alert);

      console.log(`📡 Emit Socket: Alert Approved -> Broadcast`);
      if (req.io) {
        const broadcastData = {
          ...alert,
          approved_by: managerName,
          status: "APPROVED",
        };
        req.io.emit("alert:broadcast", broadcastData);
      }
    } else {
      console.log(`🚫 Alert Rejected by ${managerName}`);
      // Nếu từ chối thì không làm gì thêm (hoặc có thể bắn socket báo admin khác là đã từ chối)
    }

    await client.query("COMMIT");
    res.json({ message: `Đã xử lý: ${status} thành công!` });
  } catch (e) {
    await client.query("ROLLBACK");
    console.error(e);
    res.status(500).json({ error: e.message });
  } finally {
    client.release();
  }
};

// 4. API PUBLIC (Cho người dân)
const getPublicAlerts = async (req, res) => {
  try {
    const query = `
            SELECT * FROM alert_archive
            WHERE status = 'APPROVED'
            AND created_at >= NOW() - INTERVAL '24 HOURS'
            ORDER BY created_at DESC
        `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Lỗi lấy danh sách cảnh báo public:", err.message);
    res.status(500).json({ message: "Lỗi Server" });
  }
};

// ---------------------------------------------------------
// 5. API MANAGER: LẤY LỊCH SỬ DUYỆT (APPROVED & REJECTED)
// ---------------------------------------------------------
const getHistoryAlerts = async (req, res) => {
  try {
    const { status, limit } = req.query; // Hỗ trợ lọc ?status=REJECTED

    let query = `
            SELECT * FROM alert_archive
            WHERE 1=1
        `;
    const params = [];
    let pIdx = 1;

    if (status) {
      query += ` AND status = $${pIdx++}`;
      params.push(status);
    }

    query += ` ORDER BY created_at DESC LIMIT $${pIdx}`;
    params.push(limit || 100); // Mặc định lấy 100 cái mới nhất

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error("Lỗi lấy lịch sử:", err);
    res.status(500).json({ message: "Lỗi Server" });
  }
};

module.exports = {
  getPublicAlerts,
  receiveAlert,
  getPendingAlerts,
  approveAlert,
  getHistoryAlerts,
};
