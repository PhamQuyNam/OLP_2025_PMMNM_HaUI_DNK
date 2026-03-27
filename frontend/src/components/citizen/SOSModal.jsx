import { useState, useEffect } from "react";
import {
  X,
  MapPin,
  Phone,
  Send,
  AlertTriangle,
  CheckCircle,
  Navigation,
  Shield,
} from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import safetyService from "../../services/safetyService";
import { useNavigate } from "react-router-dom";
const QUICK_MESSAGES = [
  "Nước ngập quá đầu!",
  "Có người bị thương!",
  "Sạt lở, bị cô lập!",
  "Thiếu lương thực/nước!",
  "Mất điện/liên lạc!",
];

const SOSModal = ({ isOpen, onClose }) => {
  const { user, refreshLocation, userLocation } = useAuth();
  const [step, setStep] = useState(1); // 1: Kích hoạt, 2: OTP, 3: Kết quả & An toàn
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const navigate = useNavigate();

  // State mới chứa danh sách điểm an toàn
  const [safeZones, setSafeZones] = useState([]);

  const [formData, setFormData] = useState({
    otp: "",
    message: "",
    phone: user?.phone || "",
    lat: null,
    lon: null,
  });

  // Reset khi mở modal
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setSafeZones([]); // Reset list
      setFormData((prev) => ({
        ...prev,
        phone: user?.phone || "",
        message: "",
        otp: "",
      }));
      refreshLocation();
    }
  }, [isOpen, user]);

  // Sync Location
  useEffect(() => {
    if (userLocation) {
      setFormData((prev) => ({
        ...prev,
        lat: userLocation[0],
        lon: userLocation[1],
      }));
    }
  }, [userLocation]);

  // Timer OTP
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft]);

  const handleRequestOtp = async () => {
    setIsLoading(true);
    try {
      await safetyService.requestSosOtp();
      toast.success("Đã gửi mã OTP!");
      setStep(2);
      setTimeLeft(60);
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Lỗi gửi OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitSOS = async (e) => {
    e.preventDefault();
    if (!formData.lat || !formData.lon) {
      toast.error("Đang định vị...");
      refreshLocation();
      return;
    }
    if (!formData.otp || formData.otp.length < 6) {
      toast.warning("Nhập đủ 6 số OTP!");
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        ...formData,
        otp: formData.otp.trim(),
        lat: parseFloat(formData.lat),
        lon: parseFloat(formData.lon),
      };

      // Gọi API gửi SOS
      const response = await safetyService.sendSosSignal(payload);

      toast.success("GỬI TÍN HIỆU THÀNH CÔNG!");

      // 👇 LOGIC MỚI: Xử lý phản hồi từ BE
      if (response && response.nearest_safe_zones) {
        setSafeZones(response.nearest_safe_zones);
        setStep(3); // Chuyển sang bước 3: Hiển thị điểm an toàn
      } else {
        onClose(); // Nếu không có điểm an toàn thì đóng luôn như cũ
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Gửi thất bại.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigateInternal = (lat, lon) => {
    // Đóng modal trước
    onClose();

    // Chuyển về trang bản đồ (/citizen) kèm theo dữ liệu điểm đến
    navigate("/citizen", {
      state: {
        destination: [lat, lon],
        type: "SAFE_ZONE",
      },
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-4">
      <div
        className="absolute inset-0 bg-red-950/80 backdrop-blur-sm animate-pulse-slow"
        onClick={step === 3 ? onClose : undefined} // Bước 3 cho phép click ngoài để đóng
      ></div>

      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden relative z-10 animate-fade-in-up border-4 border-red-500 max-h-[90vh] flex flex-col">
        {/* HEADER: Đổi màu xanh nếu thành công (Bước 3) */}
        <div
          className={`p-3 text-white text-center relative shrink-0 transition-colors duration-500 ${
            step === 3 ? "bg-emerald-600" : "bg-red-600"
          }`}
        >
          <button
            onClick={onClose}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-white/20 rounded-full transition-colors"
          >
            <X size={20} />
          </button>

          <div
            className={`inline-block p-2 rounded-full mb-1 shadow-lg ${
              step === 3 ? "bg-emerald-700" : "bg-red-700"
            }`}
          >
            {step === 3 ? (
              <CheckCircle size={24} />
            ) : (
              <AlertTriangle size={24} />
            )}
          </div>
          <h2 className="text-lg font-black uppercase tracking-wider">
            {step === 3 ? "ĐÃ GỬI TÍN HIỆU!" : "SOS KHẨN CẤP"}
          </h2>
        </div>

        {/* BODY */}
        <div className="p-4 overflow-y-auto custom-scrollbar">
          {/* STEP 1: Kích hoạt */}
          {step === 1 && (
            <div className="text-center space-y-4">
              <div className="bg-red-50 p-3 rounded-xl border border-red-100">
                <p className="text-slate-700 font-bold mb-1 text-sm">
                  Vị trí của bạn:
                </p>
                <div className="flex items-center justify-center gap-2 text-red-600 font-mono text-base bg-white py-1.5 rounded border border-red-200 shadow-inner">
                  <MapPin size={16} className="animate-bounce" />
                  {formData.lat ? (
                    <span>
                      {formData.lat.toFixed(5)}, {formData.lon.toFixed(5)}
                    </span>
                  ) : (
                    <span className="text-xs animate-pulse">
                      Đang định vị...
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={handleRequestOtp}
                disabled={isLoading}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-black text-base py-3 rounded-xl shadow-lg shadow-red-300 transition-transform active:scale-95 flex items-center justify-center gap-2"
              >
                {isLoading ? "Đang xử lý..." : "KÍCH HOẠT SOS"}
              </button>
            </div>
          )}

          {/* STEP 2: Nhập OTP */}
          {step === 2 && (
            <form onSubmit={handleSubmitSOS} className="space-y-3">
              <div>
                <label className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  Mã OTP (Email)
                  <span className="text-red-500 font-mono">
                    {timeLeft > 0 ? `${timeLeft}s` : "Hết giờ"}
                  </span>
                </label>
                <input
                  type="text"
                  placeholder="6 số OTP"
                  maxLength={6}
                  value={formData.otp}
                  onChange={(e) =>
                    setFormData({ ...formData, otp: e.target.value })
                  }
                  className="w-full text-center text-xl font-bold tracking-widest py-2 border-2 border-red-200 rounded-xl focus:border-red-500 focus:outline-none text-red-600 placeholder:text-red-200"
                />
              </div>
              {/* ... (Phần Quick Messages & Phone giữ nguyên như cũ) ... */}
              <div>
                <label className="text-xs font-bold text-slate-700 mb-1.5 block">
                  Tình trạng:
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {QUICK_MESSAGES.map((msg, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setFormData({ ...formData, message: msg })}
                      className={`text-[10px] px-2.5 py-1 rounded-full border transition-all ${
                        formData.message === msg
                          ? "bg-red-100 border-red-500 text-red-700 font-bold"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {msg}
                    </button>
                  ))}
                </div>
                <textarea
                  placeholder="Mô tả thêm..."
                  rows={2}
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:border-red-500 outline-none resize-none"
                />
              </div>
              <div className="relative">
                <Phone
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={14}
                />
                <input
                  type="tel"
                  placeholder="SĐT liên hệ"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full pl-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-red-500 outline-none font-bold text-slate-700"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-3 rounded-xl shadow-lg shadow-red-200 flex items-center justify-center gap-2 mt-1 transition-all active:scale-[0.98]"
              >
                {isLoading ? (
                  <span className="animate-pulse text-sm">Đang gửi...</span>
                ) : (
                  <>
                    <Send size={18} />{" "}
                    <span className="text-sm">XÁC NHẬN CỨU HỘ</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* 👇 STEP 3: DANH SÁCH ĐIỂM AN TOÀN (GIAO DIỆN MỚI) */}
          {step === 3 && (
            <div className="space-y-4 animate-fade-in-up">
              <div className="bg-emerald-50 text-emerald-800 p-3 rounded-xl border border-emerald-100 text-sm text-center">
                <p className="font-bold">Đội cứu hộ đã nhận được vị trí!</p>
                <p className="text-xs mt-1 opacity-80">
                  Trong lúc chờ đợi, hãy di chuyển đến các điểm an toàn sau:
                </p>
              </div>

              <div className="space-y-2">
                {safeZones.length > 0 ? (
                  safeZones.map((zone, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl hover:border-primary transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                          <Shield size={20} />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-800">
                            {zone.name}
                          </h4>
                          <p className="text-xs text-slate-500 flex items-center gap-1">
                            <MapPin size={10} /> Cách bạn{" "}
                            <span className="font-bold text-red-500">
                              {zone.distance}
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* Nút chỉ đường */}
                      <button
                        onClick={() =>
                          handleNavigateInternal(zone.lat, zone.lon)
                        }
                        className="p-2 bg-white border border-slate-200 rounded-lg text-primary hover:bg-primary hover:text-white shadow-sm transition-all active:scale-95"
                        title="Chỉ đường trên bản đồ"
                      >
                        <Navigation size={18} />
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-slate-400 text-xs italic">
                    Không tìm thấy điểm an toàn gần đây.
                  </p>
                )}
              </div>

              <button
                onClick={onClose}
                className="w-full py-3 text-slate-500 hover:text-slate-800 text-sm font-medium hover:bg-slate-100 rounded-xl transition-colors"
              >
                Đóng cửa sổ này
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SOSModal;
