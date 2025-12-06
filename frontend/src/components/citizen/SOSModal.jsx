import { useState, useEffect } from "react";
import { X, MapPin, Phone, Send, AlertTriangle } from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import safetyService from "../../services/safetyService";

const QUICK_MESSAGES = [
  "Nước ngập quá đầu!",
  "Có người bị thương!",
  "Sạt lở, bị cô lập!",
  "Thiếu lương thực/nước!",
  "Mất điện/liên lạc!",
];

const SOSModal = ({ isOpen, onClose }) => {
  const { user, refreshLocation, userLocation } = useAuth();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  const [formData, setFormData] = useState({
    otp: "",
    message: "",
    phone: user?.phone || "",
    lat: null,
    lon: null,
  });

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setFormData((prev) => ({
        ...prev,
        phone: user?.phone || "",
        message: "",
        otp: "",
      }));
      refreshLocation();
    }
  }, [isOpen, user]);

  useEffect(() => {
    if (userLocation) {
      setFormData((prev) => ({
        ...prev,
        lat: userLocation[0],
        lon: userLocation[1],
      }));
    }
  }, [userLocation]);

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

      await safetyService.sendSosSignal(payload);
      toast.success("GỬI TÍN HIỆU THÀNH CÔNG!");
      onClose();
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Gửi thất bại.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-red-950/80 backdrop-blur-sm animate-pulse-slow"
        onClick={onClose}
      ></div>

      {/* Container chính: 
        - max-h-[90vh]: Giới hạn chiều cao tối đa bằng 90% màn hình
        - flex flex-col: Để chia Header (cố định) và Body (cuộn)
      */}
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden relative z-10 animate-fade-in-up border-4 border-red-500 max-h-[90vh] flex flex-col">
        {/* === HEADER (Cố định, Thu gọn padding) === */}
        <div className="bg-red-600 p-3 text-white text-center relative shrink-0">
          <button
            onClick={onClose}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-red-700 rounded-full transition-colors"
          >
            <X size={20} />
          </button>

          <div className="inline-block p-2 bg-red-700 rounded-full mb-1 shadow-lg">
            <AlertTriangle size={24} /> {/* Icon nhỏ hơn */}
          </div>
          <h2 className="text-lg font-black uppercase tracking-wider">
            SOS KHẨN CẤP
          </h2>
        </div>

        {/* === BODY (Cho phép cuộn nếu dài quá) === */}
        <div className="p-4 overflow-y-auto custom-scrollbar">
          {/* STEP 1 */}
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

          {/* STEP 2 */}
          {step === 2 && (
            <form onSubmit={handleSubmitSOS} className="space-y-3">
              {/* OTP Input - Thu gọn */}
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

              {/* Quick Message - Thu gọn */}
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

              {/* Phone Input - Thu gọn */}
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

              {/* Submit Btn - Thu gọn */}
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

              {timeLeft === 0 && (
                <button
                  type="button"
                  onClick={handleRequestOtp}
                  className="w-full text-center text-[10px] text-slate-500 underline hover:text-red-500 mt-1"
                >
                  Gửi lại mã OTP
                </button>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default SOSModal;
