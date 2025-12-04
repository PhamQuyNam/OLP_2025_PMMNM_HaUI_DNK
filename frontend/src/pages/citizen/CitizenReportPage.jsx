import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import reportService from "../../services/reportService";
import {
  MapPin,
  Send,
  AlertTriangle,
  Phone,
  FileText,
  Navigation,
} from "lucide-react";
import { toast } from "react-toastify";

const CitizenReportPage = () => {
  const { user, userLocation, refreshLocation } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // State của Form
  const [formData, setFormData] = useState({
    type: "FLOOD", // Mặc định là Ngập lụt
    description: "",
    phone: user?.phone || "", // Tự điền SĐT nếu có trong hồ sơ
    lat: "",
    lon: "",
  });

  // Tự động lấy vị trí khi vào trang
  useEffect(() => {
    // Nếu trong Context đã có vị trí GPS
    if (userLocation) {
      setFormData((prev) => ({
        ...prev,
        lat: userLocation[0], // Vĩ độ
        lon: userLocation[1], // Kinh độ
      }));
    } else {
      // Nếu chưa có, thử kích hoạt lại GPS
      refreshLocation();
      toast.info("Đang lấy vị trí hiện tại của bạn...");
    }
  }, [userLocation, refreshLocation]);

  // Xử lý nhập liệu
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Gửi báo cáo
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate cơ bản
    if (!formData.lat || !formData.lon) {
      toast.error("Chưa xác định được vị trí. Vui lòng bật GPS!");
      refreshLocation();
      return;
    }

    setIsLoading(true);
    try {
      // Gọi API
      await reportService.createReport(formData);

      toast.success("Gửi báo cáo thành công! Cảm ơn đóng góp của bạn.");

      // Chuyển hướng về trang chủ để xem bản đồ
      navigate("/citizen");
    } catch (error) {
      console.error(error);
      const msg =
        error.response?.data?.message || "Gửi thất bại. Vui lòng thử lại.";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 pb-24">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <AlertTriangle className="text-orange-500" />
            Gửi Báo Cáo Sự Cố
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Thông tin của bạn giúp cộng đồng phòng tránh rủi ro.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-6"
        >
          {/* 1. Loại sự cố */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Loại thiên tai / Sự cố
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* Option: FLOOD */}
              <label
                className={`cursor-pointer border rounded-xl p-3 flex flex-col items-center justify-center gap-2 transition-all ${
                  formData.type === "FLOOD"
                    ? "bg-blue-50 border-blue-500 text-blue-700 ring-1 ring-blue-500"
                    : "hover:bg-slate-50"
                }`}
              >
                <input
                  type="radio"
                  name="type"
                  value="FLOOD"
                  checked={formData.type === "FLOOD"}
                  onChange={handleChange}
                  className="hidden"
                />
                <span className="text-2xl">🌊</span>
                <span className="font-bold text-sm">Ngập lụt</span>
              </label>

              {/* Option: LANDSLIDE */}
              <label
                className={`cursor-pointer border rounded-xl p-3 flex flex-col items-center justify-center gap-2 transition-all ${
                  formData.type === "LANDSLIDE"
                    ? "bg-orange-50 border-orange-500 text-orange-700 ring-1 ring-orange-500"
                    : "hover:bg-slate-50"
                }`}
              >
                <input
                  type="radio"
                  name="type"
                  value="LANDSLIDE"
                  checked={formData.type === "LANDSLIDE"}
                  onChange={handleChange}
                  className="hidden"
                />
                <span className="text-2xl">⛰️</span>
                <span className="font-bold text-sm">Sạt lở đất</span>
              </label>
            </div>
          </div>

          {/* 2. Vị trí (Readonly) */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Vị trí của bạn
            </label>
            <div
              className={`flex items-center gap-3 p-3 rounded-xl border ${
                formData.lat
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                  : "bg-red-50 border-red-200 text-red-700"
              }`}
            >
              <Navigation
                size={20}
                className={formData.lat ? "animate-pulse" : ""}
              />
              <div className="flex-1">
                {formData.lat ? (
                  <p className="font-mono text-sm font-bold">
                    {Number(formData.lat).toFixed(6)},{" "}
                    {Number(formData.lon).toFixed(6)}
                  </p>
                ) : (
                  <p className="text-sm font-bold">Đang dò tìm GPS...</p>
                )}
              </div>
              {!formData.lat && (
                <button
                  type="button"
                  onClick={refreshLocation}
                  className="text-xs bg-white border border-red-300 px-2 py-1 rounded shadow-sm hover:bg-red-50"
                >
                  Thử lại
                </button>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-1 pl-1">
              * Hệ thống tự động lấy vị trí hiện tại của thiết bị.
            </p>
          </div>

          {/* 3. Mô tả chi tiết */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Mô tả hiện trường
            </label>
            <div className="relative">
              <FileText
                className="absolute left-3 top-3 text-slate-400"
                size={18}
              />
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows="3"
                placeholder="Ví dụ: Nước ngập qua yên xe máy, dòng chảy mạnh..."
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none"
              ></textarea>
            </div>
          </div>

          {/* 4. Số điện thoại liên hệ */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Số điện thoại liên hệ
            </label>
            <div className="relative">
              <Phone
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                placeholder="09..."
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !formData.lat}
            className="w-full bg-primary hover:bg-sky-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-sky-200 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Send size={20} /> Gửi Báo Cáo
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CitizenReportPage;
