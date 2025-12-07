import { useEffect, useState } from "react";
import {
  Megaphone,
  Check,
  X,
  MapPin,
  Activity,
  AlertTriangle,
  AlertOctagon,
  Info,
  CloudRain,
  Clock,
} from "lucide-react";
import { toast } from "react-toastify";
import alertService from "../../services/alertService";

const ManagerAlertsPage = () => {
  const [pendingList, setPendingList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Hàm tải dữ liệu (Chạy mỗi 10s để giả lập Real-time)
  const fetchPending = async () => {
    try {
      const data = await alertService.getPendingAlerts();
      if (Array.isArray(data)) {
        // Sắp xếp: Mới nhất lên đầu
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
    const interval = setInterval(fetchPending, 10000); // Polling 10s
    return () => clearInterval(interval);
  }, []);

  // Xử lý nút Duyệt/Hủy
  const handleReview = async (id, status) => {
    const actionName = status === "APPROVED" ? "DUYỆT" : "TỪ CHỐI";

    // Confirm trước khi bấm (tránh lỡ tay)
    if (!window.confirm(`Bạn chắc chắn muốn ${actionName} cảnh báo này?`))
      return;

    try {
      await alertService.reviewAlert(id, status);

      toast.success(`Đã ${actionName} cảnh báo thành công!`);

      // Xóa ngay khỏi danh sách trên màn hình (Optimistic UI)
      setPendingList((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error(error);
      toast.error("Lỗi xử lý. Vui lòng thử lại.");
    }
  };

  // Helper: Chọn màu sắc và Icon theo cấp độ (1, 2, 3)
  const getLevelInfo = (levelString) => {
    // Backend trả về string "HIGH", "VERY HIGH", "CRITICAL" hoặc số.
    // Ta map về 3 cấp độ:
    // Cấp 1 (HIGH/Thấp) -> Vàng
    // Cấp 2 (VERY HIGH/Trung bình) -> Cam
    // Cấp 3 (CRITICAL/Cao) -> Đỏ

    const level = String(levelString).toUpperCase();

    if (level.includes("HIGH") && !level.includes("VERY")) {
      return {
        color: "bg-yellow-500",
        border: "border-yellow-500",
        text: "text-yellow-500",
        label: "Cấp 1 - Cảnh giác",
        icon: Info,
      };
    }
    if (level.includes("VERY") || level == "2") {
      return {
        color: "bg-orange-500",
        border: "border-orange-500",
        text: "text-orange-500",
        label: "Cấp 2 - Nguy hiểm",
        icon: AlertTriangle,
      };
    }
    if (level.includes("CRITICAL") || level == "3") {
      return {
        color: "bg-red-600",
        border: "border-red-600",
        text: "text-red-600",
        label: "Cấp 3 - Thảm họa",
        icon: AlertOctagon,
      };
    }

    // Mặc định
    return {
      color: "bg-slate-500",
      border: "border-slate-500",
      text: "text-slate-500",
      label: "Chưa phân loại",
      icon: Activity,
    };
  };

  return (
    <div className="text-slate-100 font-sans pb-20">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-3 text-white">
          <Megaphone className="text-yellow-400 animate-pulse" size={32} />
          Phê duyệt Cảnh báo Thiên tai
        </h1>
        <p className="text-slate-400 text-sm mt-1 ml-11">
          Danh sách cảnh báo tự động từ hệ thống phân tích. Cần xác thực trước
          khi phát sóng.
        </p>
      </div>

      {/* Danh sách */}
      <div className="grid grid-cols-1 gap-6">
        {isLoading && pendingList.length === 0 ? (
          <p className="text-center text-slate-500 py-10 italic">
            Đang kết nối máy trạm phân tích...
          </p>
        ) : pendingList.length === 0 ? (
          <div className="text-center py-16 bg-slate-800/30 rounded-2xl border border-slate-700 border-dashed">
            <Check className="mx-auto text-emerald-500 mb-3" size={48} />
            <h3 className="text-lg font-bold text-white">
              Hệ thống bình thường
            </h3>
            <p className="text-slate-400 text-sm mt-1">
              Hiện không có cảnh báo rủi ro nào cần duyệt.
            </p>
          </div>
        ) : (
          pendingList.map((alert) => {
            const ui = getLevelInfo(alert.alert_level); // Lấy màu sắc
            const Icon = ui.icon;

            return (
              <div
                key={alert.id}
                className={`relative bg-slate-900 border-l-4 ${ui.border} rounded-r-xl p-6 shadow-xl flex flex-col md:flex-row gap-6 transition-all hover:translate-x-1`}
              >
                {/* Cột 1: Hình ảnh Visual */}
                <div
                  className={`w-20 h-20 rounded-2xl flex items-center justify-center shrink-0 ${ui.color} bg-opacity-20 border border-white/5`}
                >
                  <Icon size={40} className={ui.text} />
                </div>

                {/* Cột 2: Thông tin chính */}
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/10 ${ui.text}`}
                    >
                      {ui.label}
                    </span>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock size={12} />
                      Phát hiện:{" "}
                      {new Date(alert.created_at).toLocaleString("vi-VN")}
                    </span>
                  </div>

                  {/* Tiêu đề tự sinh: Trạm + Loại rủi ro */}
                  <h3 className="text-xl font-bold text-white mb-2">
                    Cảnh báo tại trạm {alert.station_name}
                  </h3>

                  {/* Thông số kỹ thuật quan trọng */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-4 bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                    <div>
                      <p className="text-slate-500 text-xs mb-1">
                        Lượng mưa 1h
                      </p>
                      <p className="font-mono font-bold text-blue-400">
                        {alert.rain_value}mm
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs mb-1">Mưa 24h</p>
                      <p className="font-mono font-bold text-sky-400">
                        {alert.rain_24h}mm
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs mb-1">
                        Dự kiến đổ bộ
                      </p>
                      <p className="font-mono font-bold text-yellow-400">
                        +{alert.estimated_toa_hours}h
                      </p>
                    </div>
                    {/* Bán kính ảnh hưởng (Giả lập nếu API chưa trả về, hoặc lấy từ context_data) */}
                    <div>
                      <p className="text-slate-500 text-xs mb-1">Bán kính</p>
                      <p className="font-mono font-bold text-white">~5km</p>
                    </div>
                  </div>
                </div>

                {/* Cột 3: Nút Hành động */}
                <div className="flex flex-row md:flex-col gap-3 w-full md:w-auto items-center justify-center border-t md:border-t-0 md:border-l border-slate-700 pt-4 md:pt-0 md:pl-6">
                  <button
                    onClick={() => handleReview(alert.id, "APPROVED")}
                    className="flex-1 w-full md:w-36 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20 transition-all active:scale-95"
                  >
                    <Check size={18} /> PHÁT TIN
                  </button>

                  <button
                    onClick={() => handleReview(alert.id, "REJECTED")}
                    className="flex-1 w-full md:w-36 bg-slate-800 hover:bg-red-900/30 text-slate-400 hover:text-red-400 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 border border-slate-700 transition-all active:scale-95"
                  >
                    <X size={18} /> Hủy bỏ
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
