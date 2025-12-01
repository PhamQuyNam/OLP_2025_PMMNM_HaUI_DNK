import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, LogIn, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { toast } from "react-toastify"; // Import Toast
import AuthLayout from "../../layouts/AuthLayout";
import authService from "../../services/authService"; // Import Service

// --- COMPONENT INPUT (Tái sử dụng từ RegisterPage) ---
const InputField = ({
  icon: Icon,
  type,
  placeholder,
  label,
  name,
  value,
  onChange,
  required = true,
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
          placeholder={placeholder}
          className={`w-full pl-11 py-3.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 shadow-sm transition-all font-medium text-slate-700 placeholder:text-slate-400 ${
            isPasswordType ? "pr-12" : "pr-4"
          }`}
        />

        {/* Nút ẩn/hiện mật khẩu */}
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

// --- COMPONENT CHÍNH ---
const LoginPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // 1. State lưu dữ liệu
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // 2. Hàm xử lý nhập liệu
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // 3. Hàm xử lý Đăng nhập (GỌI API THẬT)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log("Submitting Login:", formData);

      // Gọi API Login
      const response = await authService.login(formData);

      console.log("Login Response:", response);

      // --- XỬ LÝ SAU KHI LOGIN THÀNH CÔNG ---

      // 1. Lưu Token & User info vào LocalStorage
      // (Tùy vào cấu trúc trả về của BE, thường là response.token hoặc response.accessToken)
      const token = response.token || response.accessToken;
      if (token) {
        localStorage.setItem("token", token);
      }

      if (response.user) {
        localStorage.setItem("user", JSON.stringify(response.user));
      }

      // 2. Hiệu ứng thành công
      setIsSuccess(true);
      toast.success("Đăng nhập thành công!");

      // 3. Điều hướng dựa trên vai trò (Role)
      // Đợi 1 chút để người dùng thấy hiệu ứng check xanh
      setTimeout(() => {
        const role = response.user?.role || "CITIZEN"; // Mặc định là dân

        if (role === "MANAGER" || role === "ADMIN") {
          navigate("/manager");
        } else {
          navigate("/citizen");
        }
      }, 800);
    } catch (error) {
      console.error("Login Error:", error);
      // Hiển thị lỗi từ Backend
      const message =
        error.response?.data?.message ||
        error.message ||
        "Email hoặc mật khẩu không đúng.";
      toast.error(message);
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Chào mừng trở lại"
      subtitle="Đăng nhập để tiếp tục hành trình an toàn."
    >
      <form onSubmit={handleSubmit} className="space-y-5 animate-fade-in-up">
        {/* Email Input */}
        <InputField
          icon={Mail}
          type="email"
          label="Email"
          placeholder="name@example.com"
          name="email"
          value={formData.email}
          onChange={handleChange}
        />

        {/* Password Input */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center ml-1">
            <span className="text-sm font-bold text-slate-700"></span>{" "}
            {/* Label đã có trong InputField, chỗ này để căn chỉnh link Quên mật khẩu */}
            <a
              href="#"
              className="text-xs font-semibold text-primary hover:text-sky-600 hover:underline transition-colors mb-1"
            >
              Quên mật khẩu?
            </a>
          </div>

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

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || isSuccess}
          className={`w-full font-bold py-4 rounded-2xl shadow-lg transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 mt-4
            ${
              isSuccess
                ? "bg-emerald-500 text-white shadow-emerald-200 cursor-default"
                : "bg-gradient-to-r from-primary to-sky-600 text-white shadow-sky-200 hover:shadow-sky-300 hover:-translate-y-0.5"
            }
            disabled:opacity-70 disabled:cursor-not-allowed
          `}
        >
          {isLoading ? (
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : isSuccess ? (
            <>
              <CheckCircle2 size={22} className="animate-bounce" />
              Đăng nhập thành công!
            </>
          ) : (
            <>
              <LogIn size={20} />
              Đăng nhập ngay
            </>
          )}
        </button>
      </form>

      <div className="mt-10 text-center">
        <p className="text-slate-500 text-sm font-medium">
          Chưa có tài khoản?{" "}
          <Link
            to="/register"
            className="text-primary font-bold hover:text-sky-700 hover:underline transition-colors ml-1"
          >
            Đăng ký miễn phí
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;
