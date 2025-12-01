import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock, Phone, ArrowRight, Eye, EyeOff } from "lucide-react";
import { toast } from "react-toastify"; // Import Toast thông báo
import AuthLayout from "../../layouts/AuthLayout";
import authService from "../../services/authService"; // Import Service gọi API

// --- COMPONENT INPUT (Đã nâng cấp để nhận dữ liệu từ Form) ---
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
          // Logic: Nếu là password thì check state showPassword để đổi thành text
          type={isPasswordType ? (showPassword ? "text" : "password") : type}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          className={`w-full pl-11 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 shadow-sm transition-all font-medium text-slate-700 placeholder:text-slate-400 ${
            isPasswordType ? "pr-12" : "pr-4"
          }`}
        />

        {/* Chỉ hiện nút mắt nếu là ô mật khẩu */}
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
const RegisterPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // 1. Khởi tạo State để lưu dữ liệu form
  const [formData, setFormData] = useState({
    username: "",
    phone: "",
    email: "",
    password: "",
  });

  // 2. Hàm xử lý khi gõ phím
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // 3. Hàm xử lý Submit Form (GỌI API THẬT)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Chuẩn bị dữ liệu gửi sang Backend
      // Lưu ý: Cấu trúc này phải khớp với yêu cầu của Swagger BE
      const payload = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        phone: formData.phone, // Nếu BE chưa hỗ trợ phone thì nó sẽ tự bỏ qua
        role: "CITIZEN", // Mặc định đăng ký là dân
      };

      console.log("Submitting Register:", payload); // Log để debug

      // Gọi Service
      await authService.register(payload);

      // Nếu thành công (không nhảy vào catch)
      toast.success("Đăng ký thành công! Vui lòng đăng nhập.");

      // Chuyển hướng sang trang Login
      navigate("/login");
    } catch (error) {
      // Xử lý lỗi
      console.error("Register Error:", error);

      // Hiển thị thông báo lỗi chi tiết (nếu BE trả về message)
      const message =
        error.response?.data?.message ||
        error.message ||
        "Đăng ký thất bại. Vui lòng thử lại.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Tạo tài khoản mới"
      subtitle="Tham gia mạng lưới cảnh báo thiên tai quốc gia."
    >
      <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in-up">
        {/* Hàng 1: Tên & SĐT */}
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

        {/* Email */}
        <InputField
          icon={Mail}
          type="email"
          label="Email"
          placeholder="name@example.com"
          name="email"
          value={formData.email}
          onChange={handleChange}
        />

        {/* Mật khẩu */}
        <InputField
          icon={Lock}
          type="password"
          label="Mật khẩu"
          placeholder="••••••••"
          name="password"
          value={formData.password}
          onChange={handleChange}
        />

        {/* Checkbox Điều khoản */}
        <div className="flex items-start gap-3 mt-2 p-3 rounded-xl bg-slate-50 border border-slate-100">
          <div className="flex items-center h-5">
            <input
              id="terms"
              type="checkbox"
              required
              className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary cursor-pointer"
            />
          </div>
          <label
            htmlFor="terms"
            className="text-xs text-slate-500 font-medium cursor-pointer"
          >
            Tôi cam kết tuân thủ quy định về{" "}
            <span className="text-slate-800 font-bold">Cảnh báo sai lệch</span>{" "}
            và đồng ý với{" "}
            <a href="#" className="text-primary hover:underline">
              Điều khoản sử dụng
            </a>
            .
          </label>
        </div>

        {/* Nút Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-2xl shadow-lg shadow-slate-200 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 mt-2 hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              Đăng ký tài khoản
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </form>

      {/* Footer Chuyển trang */}
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
