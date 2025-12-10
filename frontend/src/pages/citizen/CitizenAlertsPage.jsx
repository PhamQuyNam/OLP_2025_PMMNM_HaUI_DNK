/**
 * Copyright 2025 HaUI.DNK
 *
 * Licensed under the Apache License, Version 2.0
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND.
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Megaphone,
  Clock,
  MapPin,
  AlertTriangle,
  AlertOctagon,
  Info,
  Droplets,
  Mountain,
  ArrowRight, // Thêm icon mũi tên
} from "lucide-react";
import { toast } from "react-toastify";
import alertService from "../../services/alertService";
import { STATIC_STATIONS } from "../../constants/stations";

const CitizenAlertsPage = () => {
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate(); //

  const handleLocate = (alert) => {
    let targetLat = alert.lat;
    let targetLon = alert.lon;

    // Lớp 1: Nếu API cảnh báo không trả về tọa độ
    if (!targetLat || !targetLon) {
      // Lớp 2: Tìm trong file cứng theo Station ID
      let station = STATIC_STATIONS.find((s) => s.id === alert.station_id);

      // Lớp 3: Nếu không thấy ID, tìm theo Tên trạm (tương đối)
      if (!station) {
        station = STATIC_STATIONS.find((s) => s.name === alert.station_name);
      }

      // Nếu tìm thấy trong file cứng -> Gán tọa độ
      if (station) {
        targetLat = station.lat;
        targetLon = station.lon;
      }
    }

    // Kiểm tra kết quả cuối cùng
    if (targetLat && targetLon) {
      // Bay sang bản đồ và truyền tọa độ đích
      navigate("/citizen", {
        state: { destination: [targetLat, targetLon] },
      });
    } else {
      toast.warning("Chưa có thông tin vị trí cụ thể cho cảnh báo này.");
    }
  };

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const data = await alertService.getCitizenAlerts();

        if (Array.isArray(data)) {
          // Logic lọc trùng: Chỉ lấy cảnh báo mới nhất của mỗi trạm
          const uniqueAlertsMap = new Map();

          data.forEach((alert) => {
            const existing = uniqueAlertsMap.get(alert.station_name);
            if (
              !existing ||
              new Date(alert.created_at) > new Date(existing.created_at)
            ) {
              uniqueAlertsMap.set(alert.station_name, alert);
            }
          });

          const uniqueList = Array.from(uniqueAlertsMap.values());

          // Sắp xếp: Cấp độ cao lên đầu
          const sortedList = uniqueList.sort((a, b) => {
            const getScore = (lvl) => {
              if (lvl.includes("CRITICAL") || lvl == "3") return 3;
              if (lvl.includes("VERY") || lvl == "2") return 2;
              return 1;
            };
            return getScore(b.alert_level) - getScore(a.alert_level);
          });

          setAlerts(sortedList);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAlerts();
  }, []);

  const getLevelStyle = (level) => {
    const l = String(level).toUpperCase();
    if (l.includes("CRITICAL") || l == "3")
      return {
        bg: "bg-red-50",
        border: "border-red-500",
        text: "text-red-600",
        icon: AlertOctagon,
      };
    if (l.includes("VERY") || l == "2")
      return {
        bg: "bg-orange-50",
        border: "border-orange-500",
        text: "text-orange-600",
        icon: AlertTriangle,
      };
    return {
      bg: "bg-yellow-50",
      border: "border-yellow-500",
      text: "text-yellow-600",
      icon: Info,
    };
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 pb-24">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <Megaphone className="text-red-500" />
          Cảnh báo Thiên tai
        </h1>

        <div className="space-y-4">
          {isLoading ? (
            <p className="text-center text-slate-500">Đang cập nhật...</p>
          ) : alerts.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-slate-500">
                Hiện không có cảnh báo nguy hiểm nào.
              </p>
            </div>
          ) : (
            alerts.map((alert) => {
              const style = getLevelStyle(alert.alert_level);
              const LevelIcon = style.icon;

              return (
                <div
                  key={alert.id}
                  className={`bg-white rounded-xl shadow-sm border-l-4 ${style.border} p-4 relative overflow-hidden`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`p-3 rounded-full ${style.bg} ${style.text} shrink-0`}
                    >
                      <LevelIcon size={24} />
                    </div>

                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${style.bg} ${style.text}`}
                        >
                          {alert.alert_level}
                        </span>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Clock size={12} />{" "}
                          {new Date(alert.created_at)
                            .toLocaleTimeString()
                            .slice(0, 5)}
                        </span>
                      </div>

                      <h3 className="font-bold text-slate-800 text-lg mb-1">
                        {alert.station_name}
                      </h3>

                      <p className="text-sm text-slate-600 mb-3 leading-relaxed">
                        {alert.description || alert.message}
                      </p>

                      <div className="flex items-center gap-4 text-xs font-medium text-slate-500 bg-slate-50 p-2 rounded-lg mb-2">
                        <span className="flex items-center gap-1">
                          {alert.risk_type === "FLOOD" ? (
                            <Droplets size={14} className="text-blue-500" />
                          ) : (
                            <Mountain size={14} className="text-amber-500" />
                          )}
                          {alert.risk_type === "FLOOD" ? "Lũ lụt" : "Sạt lở"}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin size={14} />
                          Đổ bộ:{" "}
                          <span className="text-slate-800 font-bold">
                            +{alert.estimated_toa_hours}h
                          </span>
                        </span>
                      </div>

                      <button
                        onClick={() => handleLocate(alert)}
                        className="w-full mt-2 py-2 flex items-center justify-center gap-2 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
                      >
                        <MapPin size={14} /> Xem vị trí nguy hiểm{" "}
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default CitizenAlertsPage;
