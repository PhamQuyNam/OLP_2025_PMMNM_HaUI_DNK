import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock, Shield, Phone } from "lucide-react";
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

  return (
    <AuthLayout
      title="Tạo tài khoản mới"
      subtitle="Tham gia mạng lưới cảnh báo thiên tai quốc gia."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Full Name */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700">
            Họ và tên
          </label>
          <div className="relative">
            <User
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              required
              placeholder="Nguyễn Văn A"
              className="form-input w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
            />
          </div>
        </div>

        {/* Phone (Quan trọng để nhận SMS cảnh báo) */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700">
            Số điện thoại
          </label>
          <div className="relative">
            <Phone
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="tel"
              required
              placeholder="0912 345 678"
              className="form-input w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
            />
          </div>
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700">Email</label>
          <div className="relative">
            <Mail
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="email"
              required
              placeholder="email@example.com"
              className="form-input w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700">
            Mật khẩu
          </label>
          <div className="relative">
            <Lock
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="password"
              required
              placeholder="••••••••"
              className="form-input w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
            />
          </div>
        </div>

        <div className="flex items-start gap-2 mt-2">
          <input
            type="checkbox"
            id="term"
            required
            className="mt-1 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <label htmlFor="term" className="text-sm text-slate-500">
            Tôi đồng ý với{" "}
            <a href="#" className="text-primary hover:underline">
              Điều khoản sử dụng
            </a>{" "}
            và{" "}
            <a href="#" className="text-primary hover:underline">
              Chính sách bảo mật
            </a>
            .
          </label>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 mt-4"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            "Đăng ký tài khoản"
          )}
        </button>
      </form>

      <div className="mt-6 text-center text-slate-500 text-sm">
        Đã có tài khoản?{" "}
        <Link to="/login" className="font-bold text-primary hover:underline">
          Đăng nhập ngay
        </Link>
      </div>
    </AuthLayout>
  );
};

export default RegisterPage;
