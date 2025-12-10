/**
 * Copyright 2025 HaUI.DNK
 *
 * Licensed under the Apache License, Version 2.0
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND.
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Hook điều hướng
import {
  Megaphone,
  Check,
  X,
  Clock,
  AlertTriangle,
  AlertOctagon,
  Info,
  Waves,
  Mountain,
  MapPin, // Icon MapPin
} from "lucide-react";
import { toast } from "react-toastify";
import alertService from "../../services/alertService";
import { useSocket } from "../../context/SocketContext";
import { STATIC_STATIONS } from "../../constants/stations";

const ManagerAlertsPage = () => {
  const [activeTab, setActiveTab] = useState("PENDING");
  const [displayList, setDisplayList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const socket = useSocket();
  const navigate = useNavigate();

  const handleLocate = (alert) => {
    let targetLat = alert.lat;
    let targetLon = alert.lon;

    // Nếu API không trả về tọa độ, tìm trong file cứng
    if (!targetLat || !targetLon) {
      // Tìm theo ID trước
      let station = STATIC_STATIONS.find((s) => s.id === alert.station_id);

      // Nếu không thấy ID, tìm theo Tên (gần đúng)
      if (!station) {
        station = STATIC_STATIONS.find((s) => s.name === alert.station_name);
      }

      if (station) {
        targetLat = station.lat;
        targetLon = station.lon;
      }
    }

    if (targetLat && targetLon) {
      // Chuyển sang Dashboard và zoom vào đó
      navigate("/manager", {
        state: { focusLocation: [targetLat, targetLon] },
      });
    } else {
      toast.warning("Không tìm thấy tọa độ của trạm này!");
    }
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === "PENDING") {
        // Tab Chờ duyệt: Gọi API Pending
        const data = await alertService.getPendingAlerts();
        if (Array.isArray(data)) setDisplayList(data);
      } else {
        // Tab Lịch sử (Duyệt/Hủy): Gọi API History rồi lọc tại Frontend
        const historyData = await alertService.getHistoryAlerts();
        if (Array.isArray(historyData)) {
          // Lọc theo trạng thái Tab đang chọn
          const filtered = historyData.filter(
            (item) => item.status === activeTab
          );
          // Sắp xếp mới nhất lên đầu
          const sorted = filtered.sort(
            (a, b) => new Date(b.created_at) - new Date(a.created_at)
          );
          setDisplayList(sorted);
        }
      }
    } catch (error) {
      console.error(error);
      setDisplayList([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  // Socket: Chỉ nghe khi ở Tab Pending
  useEffect(() => {
    if (!socket || activeTab !== "PENDING") return;
    socket.on("alert:new_pending", (newAlert) => {
      toast.info(`⚠️ Cảnh báo mới: ${newAlert.station_name}`);
      setDisplayList((prev) => [newAlert, ...prev]);
    });
    return () => socket.off("alert:new_pending");
  }, [socket, activeTab]);

  const handleReview = async (id, status) => {
    if (!window.confirm("Xác nhận hành động?")) return;
    try {
      await alertService.reviewAlert(id, status);
      toast.success("Thành công!");
      setDisplayList((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      toast.error("Lỗi xử lý.");
    }
  };

  // Helper hiển thị cấp độ (như cũ)
  const getLevelInfo = (levelString) => {
    const level = String(levelString).toUpperCase();
    if (level.includes("CRITICAL") || level == "3")
      return {
        border: "border-red-600",
        text: "text-red-600",
        label: "Cấp 3 - Thảm họa",
      };
    if (level.includes("VERY") || level == "2")
      return {
        border: "border-orange-500",
        text: "text-orange-500",
        label: "Cấp 2 - Nguy hiểm",
      };
    return {
      border: "border-yellow-500",
      text: "text-yellow-500",
      label: "Cấp 1 - Cảnh báo",
    };
  };

  const getRiskIcon = (type) => (type === "FLOOD" ? Waves : Mountain);

  return (
    <div className="text-slate-100 font-sans pb-20">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-3 text-white mb-4">
          <Megaphone className="text-yellow-400" size={28} />
          Quản lý Cảnh báo
        </h1>

        {/* --- TABS --- */}
        <div className="flex gap-2 border-b border-slate-700 pb-1">
          <TabButton
            label="Chờ duyệt"
            count={activeTab === "PENDING" ? displayList.length : null}
            isActive={activeTab === "PENDING"}
            onClick={() => setActiveTab("PENDING")}
            activeColor="text-yellow-400 border-yellow-400"
          />
          <TabButton
            label="Đã duyệt"
            isActive={activeTab === "APPROVED"}
            onClick={() => setActiveTab("APPROVED")}
            activeColor="text-emerald-400 border-emerald-400"
          />
          <TabButton
            label="Đã từ chối"
            isActive={activeTab === "REJECTED"}
            onClick={() => setActiveTab("REJECTED")}
            activeColor="text-red-400 border-red-400"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {isLoading ? (
          <p className="text-center py-10 text-slate-500">
            Đang tải dữ liệu...
          </p>
        ) : displayList.length === 0 ? (
          <div className="text-center py-10 bg-slate-800/30 rounded-xl border border-slate-700 border-dashed text-slate-500">
            Danh sách trống.
          </div>
        ) : (
          displayList.map((alert) => {
            const levelUI = getLevelInfo(alert.alert_level);
            const RiskIcon = getRiskIcon(alert.risk_type);

            return (
              <div
                key={alert.id}
                className={`bg-slate-900 border-l-4 ${levelUI.border} rounded-r-xl p-4 shadow-lg flex flex-col lg:flex-row gap-4`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-white/10 ${levelUI.text}`}
                    >
                      {levelUI.label}
                    </span>
                    <span className="text-[10px] text-slate-500 flex items-center gap-1">
                      <Clock size={10} />{" "}
                      {new Date(alert.created_at).toLocaleString("vi-VN")}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <RiskIcon size={18} /> {alert.station_name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 italic">
                    "{alert.description || alert.message}"
                  </p>

                  <button
                    onClick={() => handleLocate(alert)}
                    className="mt-3 flex items-center gap-1 text-xs bg-slate-800 hover:bg-primary hover:text-white px-3 py-1.5 rounded border border-slate-700 transition-colors"
                  >
                    <MapPin size={12} /> Xem vị trí
                  </button>
                </div>

                {/* Hành động */}
                {activeTab === "PENDING" ? (
                  <div className="flex flex-col justify-center gap-2 border-l border-slate-700 pl-4 min-w-[100px]">
                    <button
                      onClick={() => handleReview(alert.id, "APPROVED")}
                      className="bg-emerald-600 text-white font-bold py-2 rounded text-xs"
                    >
                      DUYỆT
                    </button>
                    <button
                      onClick={() => handleReview(alert.id, "REJECTED")}
                      className="bg-slate-800 text-slate-400 font-bold py-2 rounded text-xs border border-slate-700"
                    >
                      TỪ CHỐI
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center px-4 border-l border-slate-700">
                    <span
                      className={`font-bold text-xs ${
                        activeTab === "APPROVED"
                          ? "text-emerald-500"
                          : "text-red-500"
                      }`}
                    >
                      {activeTab === "APPROVED" ? "ĐÃ PHÁT TIN" : "ĐÃ HỦY"}
                    </span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

const TabButton = ({ label, isActive, onClick, activeColor, count }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
      isActive
        ? activeColor
        : "text-slate-500 border-transparent hover:text-slate-300"
    }`}
  >
    {label}{" "}
    {count ? (
      <span className="bg-slate-700 text-white px-1.5 py-0.5 rounded text-[10px]">
        {count}
      </span>
    ) : null}
  </button>
);

export default ManagerAlertsPage;
