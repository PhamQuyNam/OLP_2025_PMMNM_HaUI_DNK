/**
 * Copyright 2025 HaUI.DNK
 * Licensed under the Apache License, Version 2.0
 */
import { useState, useEffect } from "react";
import {
  X,
  MapPin,
  Phone,
  Send,
  AlertTriangle,
  ShieldCheck,
} from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import safetyService from "../../services/safetyService";

const QUICK_MESSAGES = [
  "Nước ngập quá đầu, cần cano gấp!",
  "Có người bị thương/đuối nước!",
  "Sạt lở đất, bị cô lập hoàn toàn.",
  "Thiếu lương thực/nước uống nghiêm trọng.",
  "Mất điện/liên lạc, cần sơ tán người già.",
];

const SOSModal = ({ isOpen, onClose }) => {
  const { user, refreshLocation, userLocation } = useAuth();
  const [step, setStep] = useState(1); // 1: Kích hoạt, 2: Nhập OTP & Gửi
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0); // Đếm ngược OTP

  // Form State
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
      setFormData((prev) => ({
        ...prev,
        phone: user?.phone || "",
        message: "",
        otp: "",
      }));
      // Tự động lấy lại vị trí mới nhất khi bật SOS
      refreshLocation();
    }
  }, [isOpen, user]);

  // Cập nhật tọa độ từ Context vào Form
  useEffect(() => {
    if (userLocation) {
      setFormData((prev) => ({
        ...prev,
        lat: userLocation[0],
        lon: userLocation[1],
      }));
    }
  }, [userLocation]);

  // Logic đếm ngược OTP
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft]);

  // --- HÀNH ĐỘNG 1: YÊU CẦU OTP ---
  const handleRequestOtp = async () => {
    setIsLoading(true);
    try {
      await safetyService.requestSosOtp();
      toast.success("Mã OTP khẩn cấp đã gửi đến Email của bạn!");
      setStep(2);
      setTimeLeft(60); // Đếm ngược 60s
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Lỗi gửi OTP. Vui lòng thử lại!");
    } finally {
      setIsLoading(false);
    }
  };

  // --- HÀNH ĐỘNG 2: GỬI SOS ---
  const handleSubmitSOS = async (e) => {
    e.preventDefault();

    if (!formData.lat || !formData.lon) {
      toast.error("Đang định vị... Vui lòng đợi giây lát!");
      refreshLocation();
      return;
    }

    if (!formData.otp || formData.otp.length < 6) {
      toast.warning("Vui lòng nhập đúng mã OTP 6 số!");
      return;
    }

    setIsLoading(true);
    try {
      // Gọi API gửi cứu hộ
      const res = await safetyService.sendSosSignal(formData);

      // Thành công
      toast.success("TÍN HIỆU ĐÃ GỬI THÀNH CÔNG! Đội cứu hộ sẽ liên lạc sớm.");
      onClose(); // Đóng modal

      // TODO: Nếu API trả về safe_zones, có thể lưu vào context để hiển thị lên bản đồ
      if (res.safe_zones) {
        console.log("Các điểm an toàn lân cận:", res.safe_zones);
        toast.info(`Tìm thấy ${res.safe_zones.length} điểm an toàn gần bạn.`);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Gửi thất bại. Kiểm tra lại OTP!");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      {/* Overlay đỏ nhấp nháy nhẹ tạo cảm giác khẩn cấp */}
      <div
        className="absolute inset-0 bg-red-950/80 backdrop-blur-sm animate-pulse-slow"
        onClick={onClose}
      ></div>

      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden relative z-10 animate-fade-in-up border-4 border-red-500">
        {/* Header SOS */}
        <div className="bg-red-600 p-4 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-red-700 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
          <div className="inline-block p-3 bg-red-700 rounded-full mb-2 shadow-lg animate-bounce">
            <AlertTriangle size={32} />
          </div>
          <h2 className="text-2xl font-black uppercase tracking-wider">
            SOS KHẨN CẤP
          </h2>
          <p className="text-red-100 text-xs font-medium">
            Hệ thống phản ứng nhanh OLP 2025
          </p>
        </div>

        <div className="p-6">
          {/* --- BƯỚC 1: XÁC NHẬN VỊ TRÍ & GỬI OTP --- */}
          {step === 1 && (
            <div className="text-center space-y-6">
              <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                <p className="text-slate-700 font-bold mb-2">
                  Vị trí hiện tại của bạn:
                </p>
                <div className="flex items-center justify-center gap-2 text-red-600 font-mono text-lg bg-white py-2 rounded border border-red-200 shadow-inner">
                  <MapPin size={20} className="animate-bounce" />
                  {formData.lat ? (
                    <span>
                      {formData.lat.toFixed(5)}, {formData.lon.toFixed(5)}
                    </span>
                  ) : (
                    <span className="text-sm animate-pulse">
                      Đang lấy tọa độ GPS...
                    </span>
                  )}
                </div>
              </div>

              <p className="text-slate-600 text-sm">
                Nhấn nút bên dưới để nhận mã xác thực (OTP) qua Email và kích
                hoạt quy trình cứu hộ.
              </p>

              <button
                onClick={handleRequestOtp}
                disabled={isLoading}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-black text-lg py-4 rounded-2xl shadow-lg shadow-red-300 transition-transform active:scale-95 flex items-center justify-center gap-2"
              >
                {isLoading ? "Đang xử lý..." : "KÍCH HOẠT SOS NGAY"}
              </button>
            </div>
          )}

          {/* --- BƯỚC 2: NHẬP THÔNG TIN CHI TIẾT --- */}
          {step === 2 && (
            <form onSubmit={handleSubmitSOS} className="space-y-4">
              {/* OTP Input */}
              <div>
                <label className="flex justify-between text-sm font-bold text-slate-700 mb-1">
                  Mã OTP (Check Email)
                  <span className="text-red-500 font-mono">
                    {timeLeft > 0 ? `${timeLeft}s` : "Hết giờ"}
                  </span>
                </label>
                <input
                  type="text"
                  placeholder="Nhập 6 số OTP"
                  maxLength={6}
                  value={formData.otp}
                  onChange={(e) =>
                    setFormData({ ...formData, otp: e.target.value })
                  }
                  className="w-full text-center text-2xl font-bold tracking-widest py-3 border-2 border-red-200 rounded-xl focus:border-red-500 focus:outline-none text-red-600 placeholder:text-red-200"
                />
              </div>

              {/* Quick Message Chips */}
              <div>
                <label className="text-sm font-bold text-slate-700 mb-2 block">
                  Tình trạng khẩn cấp:
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {QUICK_MESSAGES.map((msg, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setFormData({ ...formData, message: msg })}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
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
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-red-500 outline-none"
                />
              </div>

              {/* Phone Input */}
              <div className="relative">
                <Phone
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={16}
                />
                <input
                  type="tel"
                  placeholder="SĐT liên hệ"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full pl-9 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-red-500 outline-none font-bold text-slate-700"
                />
              </div>

              {/* Submit Btn */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-4 rounded-xl shadow-xl shadow-red-200 flex items-center justify-center gap-2 mt-2 transition-all active:scale-[0.98]"
              >
                {isLoading ? (
                  <span className="animate-pulse">Đang gửi tín hiệu...</span>
                ) : (
                  <>
                    <Send size={20} /> XÁC NHẬN CỨU HỘ
                  </>
                )}
              </button>

              {timeLeft === 0 && (
                <button
                  type="button"
                  onClick={handleRequestOtp}
                  className="w-full text-center text-xs text-slate-500 underline hover:text-red-500"
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
