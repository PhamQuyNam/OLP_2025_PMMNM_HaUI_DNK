/**
 * Copyright 2025 HaUI.DNK
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 */

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Lock,
  Phone,
  ArrowRight,
  Eye,
  EyeOff,
  KeyRound,
  Navigation,
} from "lucide-react";
import { toast } from "react-toastify";
import AuthLayout from "../../layouts/AuthLayout";
import authService from "../../services/authService";

// Component Input (Giữ nguyên)
const InputField = ({
  icon: Icon,
  type,
  placeholder,
  label,
  name,
  value,
  onChange,
  required = true,
  disabled = false,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordType = type === "password";

  return (
    <div className="space-y-1.5 group">
      <label className="text-sm font-bold text-slate-700 ml-1">{label}</label>
      <div className="relative transition-all duration-300 transform group-focus-within:scale-[1.01]">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
          <Icon size={18} />
        </div>
        <input
          type={isPasswordType ? (showPassword ? "text" : "password") : type}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          placeholder={placeholder}
          className={`w-full pl-11 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 shadow-sm transition-all font-medium text-slate-700 placeholder:text-slate-400 disabled:bg-slate-100 disabled:text-slate-500 ${
            isPasswordType ? "pr-12" : "pr-4"
          }`}
        />
        {isPasswordType && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary focus:outline-none transition-colors cursor-pointer"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
    </div>
  );
};

const RegisterPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // State đếm ngược thời gian OTP (120 giây)
  const [timeLeft, setTimeLeft] = useState(120);

  // State quản lý bước: 1 = Nhập thông tin, 2 = Nhập OTP
  const [step, setStep] = useState(1);

  // State dữ liệu form
  const [formData, setFormData] = useState({
    username: "",
    phone: "",
    email: "",
    password: "",
    otp: "",
    role: "CITIZEN", // Mặc định
    lat: 18.3436, // Tọa độ mặc định (Hà Tĩnh)
    lon: 105.9002,
  });

  // --- LOGIC ĐẾM NGƯỢC THỜI GIAN ---
  useEffect(() => {
    // Chỉ chạy khi ở bước 2 và thời gian > 0
    if (step === 2 && timeLeft > 0) {
      const timerId = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timerId); // Dọn dẹp timer
    }
  }, [step, timeLeft]);

  // Hàm format giây thành mm:ss (VD: 120 -> 02:00)
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;
  };
  // ---------------------------------

  // Tự động lấy GPS khi vào trang đăng ký (Đã cấu hình chính xác cao)
  useEffect(() => {
    if (navigator.geolocation) {
      const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      };

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setFormData((prev) => ({
            ...prev,
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
          }));
          // Log kiểm tra độ chính xác (nếu cần)
          // console.log("Độ chính xác (mét):", pos.coords.accuracy);
        },
        (err) => {
          console.error("Không lấy được GPS:", err);
        },
        options
      );
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- XỬ LÝ BƯỚC 1: YÊU CẦU OTP ---
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Gọi API xin OTP
      console.log("Requesting OTP for:", formData.email);
      await authService.requestOtp(formData.email);

      toast.success(`Mã OTP đã được gửi đến ${formData.email}`);

      setTimeLeft(120); // Reset thời gian về 120s khi gửi thành công
      setStep(2); // Chuyển sang bước nhập OTP
    } catch (error) {
      console.error("OTP Error:", error);
      const message =
        error.response?.data?.message ||
        "Không thể gửi OTP. Vui lòng kiểm tra email.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // --- XỬ LÝ BƯỚC 2: ĐĂNG KÝ HOÀN TẤT ---
  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        otp: formData.otp,
        role: "CITIZEN",
        phone: formData.phone,
        lat: formData.lat,
        lon: formData.lon,
      };

      console.log("Submitting Register:", payload);

      // Gọi API Đăng ký
      await authService.register(payload);

      toast.success("Đăng ký thành công! Vui lòng đăng nhập.");
      navigate("/login");
    } catch (error) {
      console.error("Register Error:", error);
      const message =
        error.response?.data?.message || "Mã OTP không đúng hoặc đã hết hạn.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title={step === 1 ? "Tạo tài khoản mới" : "Xác thực Email"}
      subtitle={
        step === 1
          ? "Tham gia mạng lưới cảnh báo thiên tai quốc gia."
          : "Vui lòng nhập mã 6 số vừa được gửi đến email của bạn."
      }
    >
      <form
        onSubmit={step === 1 ? handleRequestOtp : handleRegister}
        className="space-y-4 animate-fade-in-up"
      >
        {/* --- BƯỚC 1: NHẬP THÔNG TIN --- */}
        <div className={step === 1 ? "block space-y-4" : "hidden"}>
          <div className="grid grid-cols-2 gap-4">
            <InputField
              icon={User}
              type="text"
              label="Họ và tên"
              placeholder="Nguyễn Văn A"
              name="username"
              value={formData.username}
              onChange={handleChange}
            />
            <InputField
              icon={Phone}
              type="tel"
              label="Số điện thoại"
              placeholder="09xx..."
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <InputField
            icon={Mail}
            type="email"
            label="Email (Nhận OTP)"
            placeholder="name@example.com"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />

          <InputField
            icon={Lock}
            type="password"
            label="Mật khẩu"
            placeholder="••••••••"
            name="password"
            value={formData.password}
            onChange={handleChange}
          />
        </div>

        {/* --- BƯỚC 2: NHẬP OTP --- */}
        <div className={step === 2 ? "block space-y-4" : "hidden"}>
          {/* Hiển thị lại email để user biết đang xác thực cho email nào */}
          <div className="bg-blue-50 border border-blue-100 p-3 rounded-xl text-center mb-4">
            <p className="text-sm text-slate-500">Mã xác thực đã gửi đến:</p>
            <p className="font-bold text-primary">{formData.email}</p>
          </div>

          {/* --- ĐỒNG HỒ ĐẾM NGƯỢC --- */}
          <div className="text-center">
            <span
              className={`text-sm font-medium transition-colors ${
                timeLeft < 30 ? "text-red-500 animate-pulse" : "text-slate-600"
              }`}
            >
              Mã sẽ hết hạn sau: {formatTime(timeLeft)}
            </span>
          </div>
          {/* ------------------------- */}

          <InputField
            icon={KeyRound}
            type="text"
            label="Mã OTP (6 số)"
            placeholder="123456"
            name="otp"
            value={formData.otp}
            onChange={handleChange}
            required={step === 2}
          />

          <div className="text-center">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-sm text-slate-400 hover:text-slate-600 hover:underline"
            >
              Quay lại nhập thông tin
            </button>
          </div>
        </div>

        {/* Nút Submit chung */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-2xl shadow-lg shadow-slate-200 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 mt-2 hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : step === 1 ? (
            <>
              Gửi mã xác thực
              <ArrowRight size={18} />
            </>
          ) : (
            <>
              Hoàn tất Đăng ký
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </form>

      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-slate-500 text-sm font-medium">
          Đã là thành viên?{" "}
          <Link
            to="/login"
            className="text-primary font-bold hover:text-sky-700 hover:underline transition-colors ml-1"
          >
            Đăng nhập ngay
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default RegisterPage;
