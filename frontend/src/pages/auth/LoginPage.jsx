import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, LogIn } from "lucide-react";
import AuthLayout from "../../layouts/AuthLayout";

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Giả lập gọi API (Sau này sẽ thay bằng axios thật)
    setTimeout(() => {
      setIsLoading(false);
      if (formData.email.includes("admin")) {
        navigate("/manager");
      } else {
        navigate("/citizen");
      }
    }, 1500);
  };

  return (
    <AuthLayout
      title="Chào mừng trở lại"
      subtitle="Đăng nhập để truy cập hệ thống cảnh báo."
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email Input */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Email</label>
          <div className="relative">
            <Mail
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={20}
            />
            <input
              type="email"
              required
              placeholder="nguyenvana@gmail.com"
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-800"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>
        </div>

        {/* Password Input */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-semibold text-slate-700">
              Mật khẩu
            </label>
            <a
              href="#"
              className="text-xs font-medium text-primary hover:underline"
            >
              Quên mật khẩu?
            </a>
          </div>
          <div className="relative">
            <Lock
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={20}
            />
            <input
              type="password"
              required
              placeholder="••••••••"
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-800"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary hover:bg-sky-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-sky-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <LogIn size={20} />
              Đăng nhập
            </>
          )}
        </button>
      </form>

      <div className="mt-8 text-center text-slate-500 text-sm">
        Chưa có tài khoản?{" "}
        <Link to="/register" className="font-bold text-primary hover:underline">
          Đăng ký miễn phí
        </Link>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;
