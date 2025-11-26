const axios = require('axios');
const { v4: uuidv4 } = require('uuid'); // Cần cài thêm: npm install uuid

// API: Người dân gửi báo cáo
const createReport = async (req, res) => {
    const { type, description, lat, lon, phone } = req.body;

    // 1. Validate dữ liệu cơ bản
    if (!lat || !lon || !type) {
        return res.status(400).json({ message: "Thiếu thông tin tọa độ hoặc loại sự cố" });
    }

    // 2. Chuẩn bị Payload NGSI-LD
    const reportId = `urn:ngsi-ld:CitizenReport:${uuidv4()}`;
    const currentTime = new Date().toISOString();

    const entity = {
        "id": reportId,
        "type": "CitizenReport",
        "reportType": { "type": "Property", "value": type },
        "description": { "type": "Property", "value": description || "Không có mô tả" },
        "status": { "type": "Property", "value": "PENDING" }, // Mặc định là chờ xử lý
        "reporterPhone": { "type": "Property", "value": phone || "Anonymous" },
        "reportTime": { "type": "Property", "value": currentTime },
        "location": {
            "type": "GeoProperty",
            "value": {
                "type": "Point",
                "coordinates": [parseFloat(lon), parseFloat(lat)] // GeoJSON: [Lon, Lat]
            }
        },
        "@context": ["https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context.jsonld"]
    };

    try {
        // 3. Gửi sang Orion Context Broker
        const orionUrl = `${process.env.ORION_HOST}/ngsi-ld/v1/entities`;
        await axios.post(orionUrl, entity, {
            headers: { 'Content-Type': 'application/ld+json' }
        });

        res.status(201).json({
            message: "Gửi báo cáo thành công!",
            reportId: reportId
        });

    } catch (error) {
        console.error("Lỗi gửi Orion:", error.response?.data || error.message);
        res.status(500).json({ message: "Lỗi hệ thống khi gửi báo cáo" });
    }
};

// API: Lấy danh sách báo cáo (Cho Dashboard quản lý)
const getReports = async (req, res) => {
    try {
        // Lấy các báo cáo mới nhất từ Orion
        const orionUrl = `${process.env.ORION_HOST}/ngsi-ld/v1/entities?type=CitizenReport&options=keyValues&limit=50`;
        const response = await axios.get(orionUrl);

        // Format lại dữ liệu cho đẹp
        const formattedData = response.data.map(item => ({
            id: item.id,
            type: item.reportType,
            desc: item.description,
            status: item.status,
            time: item.reportTime,
            lat: item.location?.coordinates[1],
            lon: item.location?.coordinates[0]
        }));

        res.json(formattedData);
    } catch (error) {
        res.status(500).json({ message: "Lỗi lấy danh sách báo cáo" });
    }
};

module.exports = { createReport, getReports };