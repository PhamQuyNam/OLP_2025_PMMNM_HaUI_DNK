import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock, Phone, ArrowRight, Shield } from "lucide-react";
import AuthLayout from "../../layouts/AuthLayout";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigate("/login");
    }, 1500);
  };

  // Component Input dùng chung cho gọn code
  const InputField = ({ icon: Icon, type, placeholder, label }) => (
    <div className="space-y-1.5 group">
      <label className="text-sm font-bold text-slate-700 ml-1">{label}</label>
      <div className="relative transition-all duration-300 transform group-focus-within:scale-[1.01]">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
          <Icon size={18} />
        </div>
        <input
          type={type}
          required
          placeholder={placeholder}
          className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 shadow-sm transition-all font-medium text-slate-700"
        />
      </div>
    </div>
  );

  return (
    <AuthLayout
      title="Tạo tài khoản mới"
      subtitle="Tham gia mạng lưới cảnh báo thiên tai quốc gia."
    >
      <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in-up">
        {/* Hàng 1: Tên & SĐT (Chia đôi cho gọn) */}
        <div className="grid grid-cols-2 gap-4">
          <InputField
            icon={User}
            type="text"
            label="Họ và tên"
            placeholder="Nguyễn Văn A"
          />
          <InputField
            icon={Phone}
            type="tel"
            label="Số điện thoại"
            placeholder="09xx..."
          />
        </div>

        {/* Email */}
        <InputField
          icon={Mail}
          type="email"
          label="Email"
          placeholder="name@example.com"
        />

        {/* Password */}
        <InputField
          icon={Lock}
          type="password"
          label="Mật khẩu"
          placeholder="••••••••"
        />

        {/* Checkbox điều khoản */}
        <div className="flex items-start gap-3 mt-2 p-3 rounded-xl bg-slate-50 border border-slate-100">
          <div className="flex items-center h-5">
            <input
              id="terms"
              type="checkbox"
              required
              className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
            />
          </div>
          <label htmlFor="terms" className="text-xs text-slate-500 font-medium">
            Tôi cam kết tuân thủ quy định về{" "}
            <span className="text-slate-800 font-bold">Cảnh báo sai lệch</span>{" "}
            và đồng ý với{" "}
            <a href="#" className="text-primary hover:underline">
              Điều khoản sử dụng
            </a>
            .
          </label>
        </div>

        {/* Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-2xl shadow-lg shadow-slate-200 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 mt-2 hover:-translate-y-0.5"
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
