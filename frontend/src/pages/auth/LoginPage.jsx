import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, LogIn, CheckCircle2 } from "lucide-react";
import AuthLayout from "../../layouts/AuthLayout";

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false); // Thêm state giả lập thành công

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Giả lập gọi API
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true); // Hiện thông báo thành công

      setTimeout(() => {
        if (formData.email.includes("admin")) {
          navigate("/manager");
        } else {
          navigate("/citizen");
        }
      }, 800); // Đợi 0.8s để người dùng thấy icon check xanh
    }, 1500);
  };

  return (
    <AuthLayout
      title="Chào mừng trở lại"
      subtitle="Đăng nhập để tiếp tục hành trình an toàn."
    >
      <form onSubmit={handleSubmit} className="space-y-5 animate-fade-in-up">
        {/* Email Input */}
        <div className="space-y-1.5 group">
          <label className="text-sm font-bold text-slate-700 ml-1">Email</label>
          <div className="relative transition-all duration-300 transform group-focus-within:scale-[1.01]">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
              <Mail size={20} />
            </div>
            <input
              type="email"
              required
              placeholder="name@example.com"
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 shadow-sm transition-all font-medium text-slate-700 placeholder:text-slate-400"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>
        </div>

        {/* Password Input */}
        <div className="space-y-1.5 group">
          <div className="flex justify-between items-center ml-1">
            <label className="text-sm font-bold text-slate-700">Mật khẩu</label>
            <a
              href="#"
              className="text-xs font-semibold text-primary hover:text-sky-600 hover:underline transition-colors"
            >
              Quên mật khẩu?
            </a>
          </div>
          <div className="relative transition-all duration-300 transform group-focus-within:scale-[1.01]">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
              <Lock size={20} />
            </div>
            <input
              type="password"
              required
              placeholder="••••••••"
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 shadow-sm transition-all font-medium text-slate-700 placeholder:text-slate-400"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />
          </div>
        </div>

        {/* Submit Button (Có hiệu ứng chuyển trạng thái) */}
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

      {/* Footer Link */}
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
