import { useEffect, useState } from "react";
import {
  Megaphone,
  Check,
  X,
  Activity,
  Clock,
  AlertTriangle,
  AlertOctagon,
  Info,
  Waves,
  Mountain, // Icon Sóng và Núi
  TrendingUp,
  ArrowUpFromLine,
  Layers,
  Ruler,
} from "lucide-react";
import { toast } from "react-toastify";
import alertService from "../../services/alertService";

const ManagerAlertsPage = () => {
  const [pendingList, setPendingList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load danh sách
  const fetchPending = async () => {
    try {
      const data = await alertService.getPendingAlerts();
      if (Array.isArray(data)) {
        const sorted = data.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        setPendingList(sorted);
      }
    } catch (error) {
      console.error("Lỗi tải cảnh báo:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
    const interval = setInterval(fetchPending, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleReview = async (id, status) => {
    const actionName = status === "APPROVED" ? "DUYỆT" : "TỪ CHỐI";
    if (!window.confirm(`Bạn chắc chắn muốn ${actionName} cảnh báo này?`))
      return;

    try {
      await alertService.reviewAlert(id, status);
      toast.success(`Đã ${actionName} cảnh báo thành công!`);
      setPendingList((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      toast.error("Lỗi xử lý.");
    }
  };

  // Helper 1: Màu sắc theo cấp độ
  const getLevelInfo = (levelString) => {
    const level = String(levelString).toUpperCase();
    if (level.includes("HIGH") && !level.includes("VERY")) {
      return {
        color: "bg-yellow-500",
        border: "border-yellow-500",
        text: "text-yellow-500",
        label: "Cấp 1 - Cảnh giác",
      };
    }
    if (level.includes("VERY") || level == "2") {
      return {
        color: "bg-orange-500",
        border: "border-orange-500",
        text: "text-orange-500",
        label: "Cấp 2 - Nguy hiểm",
      };
    }
    if (level.includes("CRITICAL") || level == "3") {
      return {
        color: "bg-red-600",
        border: "border-red-600",
        text: "text-red-600",
        label: "Cấp 3 - Thảm họa",
      };
    }
    return {
      color: "bg-slate-500",
      border: "border-slate-500",
      text: "text-slate-500",
      label: "Chưa phân loại",
    };
  };

  // Helper 2: Icon theo Loại thiên tai
  const getRiskInfo = (type) => {
    if (type === "FLOOD") return { icon: Waves, label: "Lũ lụt / Ngập úng" };
    if (type === "LANDSLIDE") return { icon: Mountain, label: "Sạt lở đất" };
    return { icon: Activity, label: "Thiên tai khác" };
  };

  // Helper 3: Tính phạm vi ảnh hưởng (Dựa trên File Excel)
  const getRadiusInfo = (type, levelString) => {
    const t = String(type).toUpperCase();
    const l = String(levelString).toUpperCase();

    // Logic Ngập lụt
    if (t === "FLOOD") {
      if (l.includes("CRITICAL") || l == "3") return "20+ km"; // Cấp 3
      if (l.includes("VERY") || l == "2") return "10 km"; // Cấp 2
      return "5 km"; // Cấp 1
    }
    // Logic Sạt lở
    if (t === "LANDSLIDE") {
      if (l.includes("CRITICAL") || l == "3") return "5 km"; // Cấp 3
      if (l.includes("VERY") || l == "2") return "2 km"; // Cấp 2
      return "1 km"; // Cấp 1
    }
    return "N/A";
  };

  return (
    <div className="text-slate-100 font-sans pb-20">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3 text-white">
            <Megaphone className="text-yellow-400 animate-pulse" size={28} />
            Phê duyệt Cảnh báo
          </h1>
          <p className="text-slate-400 text-xs mt-1 ml-10">
            Hệ thống phân tích rủi ro tự động (AI Analysis).
          </p>
        </div>
        <div className="bg-slate-800 px-3 py-1 rounded-lg border border-slate-700">
          <span className="text-xs text-slate-400">Chờ duyệt: </span>
          <span className="text-sm font-bold text-white">
            {pendingList.length}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {isLoading && pendingList.length === 0 ? (
          <p className="text-center text-slate-500 py-10 italic text-sm">
            Đang đồng bộ dữ liệu...
          </p>
        ) : pendingList.length === 0 ? (
          <div className="text-center py-12 bg-slate-800/30 rounded-xl border border-slate-700 border-dashed">
            <Check className="mx-auto text-emerald-500 mb-2" size={32} />
            <p className="text-slate-400 text-sm">Không có cảnh báo nào.</p>
          </div>
        ) : (
          pendingList.map((alert) => {
            const levelUI = getLevelInfo(alert.alert_level);
            const riskUI = getRiskInfo(alert.risk_type);
            const RiskIcon = riskUI.icon;
            const radiusText = getRadiusInfo(
              alert.risk_type,
              alert.alert_level
            );

            const ctx = alert.context_data || {};

            return (
              <div
                key={alert.id}
                className={`relative bg-slate-900 border-l-4 ${levelUI.border} rounded-r-xl p-4 shadow-lg flex flex-col lg:flex-row gap-4 transition-all hover:bg-slate-800/80`}
              >
                {/* CỘT 1: VISUAL & TITLE */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-white/10 ${levelUI.text}`}
                    >
                      {levelUI.label}
                    </span>
                    <span className="text-[10px] text-slate-500 flex items-center gap-1">
                      <Clock size={10} />
                      {new Date(alert.created_at).toLocaleString("vi-VN")}
                    </span>
                  </div>

                  <div className="flex items-start gap-3 mb-3">
                    {/* ICON SÓNG / NÚI Ở ĐÂY: Tôi tăng opacity nền lên để dễ nhìn hơn */}
                    <div
                      className={`p-2.5 rounded-lg ${levelUI.color} bg-opacity-30 shrink-0 border border-white/10`}
                    >
                      <RiskIcon size={28} className="text-white" />{" "}
                      {/* Icon màu trắng cho nổi */}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white leading-tight">
                        {alert.station_name}
                      </h3>
                      <p className="text-xs text-slate-400 font-medium mt-0.5">
                        {riskUI.label}
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-950/50 p-2 rounded border border-slate-800 text-xs text-slate-300 italic mb-3">
                    "{alert.description || alert.message}"
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div className="bg-slate-800 p-1.5 rounded border border-slate-700/50">
                      <p className="text-[10px] text-slate-500">Mưa 1h</p>
                      <p className="text-sm font-mono font-bold text-blue-400">
                        {alert.rain_value}mm
                      </p>
                    </div>
                    <div className="bg-slate-800 p-1.5 rounded border border-slate-700/50">
                      <p className="text-[10px] text-slate-500">Mưa 24h</p>
                      <p className="text-sm font-mono font-bold text-sky-400">
                        {alert.rain_24h}mm
                      </p>
                    </div>
                    <div className="bg-slate-800 p-1.5 rounded border border-slate-700/50">
                      <p className="text-[10px] text-slate-500">Đổ bộ sau</p>
                      <p className="text-sm font-mono font-bold text-yellow-400">
                        {alert.estimated_toa_hours}h
                      </p>
                    </div>
                    {/* PHẠM VI ẢNH HƯỞNG (Đã sửa tên & Logic từ Excel) */}
                    <div className="bg-slate-800 p-1.5 rounded border border-slate-700/50">
                      <p className="text-[10px] text-slate-500">
                        Phạm vi ảnh hưởng
                      </p>
                      <p className="text-sm font-mono font-bold text-white flex items-center gap-1">
                        <Ruler size={12} className="text-slate-400" />
                        {radiusText}
                      </p>
                    </div>
                  </div>
                </div>

                {/* CỘT 2: THÔNG SỐ (Đã bỏ Rủi ro tích lũy) */}
                <div className="lg:w-48 bg-slate-950/30 rounded-lg p-3 border border-white/5 flex flex-col justify-center text-xs space-y-2">
                  <p className="text-[10px] font-bold text-slate-500 uppercase mb-1 border-b border-white/5 pb-1">
                    Địa hình & Thủy văn
                  </p>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 flex items-center gap-1">
                      <TrendingUp size={10} /> Độ dốc:
                    </span>
                    <span className="font-mono text-white">
                      {ctx.slope ? `${ctx.slope}%` : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 flex items-center gap-1">
                      <ArrowUpFromLine size={10} /> Độ cao:
                    </span>
                    <span className="font-mono text-white">
                      {ctx.elevation ? `${ctx.elevation}m` : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Layers size={10} /> TWI (Ẩm):
                    </span>
                    <span className="font-mono text-white">
                      {ctx.twi ? Number(ctx.twi).toFixed(1) : "N/A"}
                    </span>
                  </div>
                  {/* ĐÃ XÓA MỤC RỦI RO TÍCH LŨY Ở ĐÂY */}
                </div>

                {/* CỘT 3: HÀNH ĐỘNG */}
                <div className="flex lg:flex-col gap-2 min-w-[120px] justify-center border-t lg:border-t-0 lg:border-l border-slate-700 pt-3 lg:pt-0 lg:pl-4">
                  <button
                    onClick={() => handleReview(alert.id, "APPROVED")}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-lg flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 text-xs"
                  >
                    <Check size={16} /> PHÁT TIN
                  </button>
                  <button
                    onClick={() => handleReview(alert.id, "REJECTED")}
                    className="flex-1 bg-slate-800 hover:bg-red-900/40 text-slate-400 hover:text-red-400 font-bold py-2 rounded-lg flex items-center justify-center gap-2 border border-slate-700 transition-all active:scale-95 text-xs"
                  >
                    <X size={16} /> HỦY BỎ
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ManagerAlertsPage;
