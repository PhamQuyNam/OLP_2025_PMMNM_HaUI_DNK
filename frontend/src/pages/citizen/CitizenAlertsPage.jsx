import { useEffect, useState } from "react";
import {
  Megaphone,
  Clock,
  MapPin,
  AlertTriangle,
  AlertOctagon,
  Info,
  Droplets,
  Mountain,
} from "lucide-react";
import alertService from "../../services/alertService";

const CitizenAlertsPage = () => {
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const data = await alertService.getCitizenAlerts();
        if (Array.isArray(data)) setAlerts(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAlerts();
  }, []);

  // Helper hiển thị màu sắc
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

                      <div className="flex items-center gap-4 text-xs font-medium text-slate-500 bg-slate-50 p-2 rounded-lg">
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
