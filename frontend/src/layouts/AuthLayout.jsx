import { Link } from "react-router-dom";
import { ShieldCheck, ArrowLeft } from "lucide-react";

const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen flex bg-slate-50 font-sans">
      {/* === CỘT TRÁI: ARTWORK & BRANDING === */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 relative overflow-hidden items-center justify-center">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:40px_40px] opacity-20"></div>

        {/* Ambient Light */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>

        <div className="relative z-10 text-center px-12">
          <div className="mb-8 flex justify-center">
            <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center border border-white/10 shadow-2xl">
              <ShieldCheck size={48} className="text-primary" />
            </div>
          </div>
          <h2 className="text-4xl font-bold text-white mb-4 tracking-tight">
            Viet Resilience Hub
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed">
            Nền tảng dữ liệu mở cảnh báo thiên tai và hỗ trợ cứu hộ khẩn cấp.
            <br />
            Kết nối cộng đồng - Vững vàng trước bão lũ.
          </p>

          {/* Badge OLP */}
          <div className="mt-12 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
            <span className="text-xs font-bold text-slate-300 tracking-wider uppercase">
              Sản phẩm dự thi OLP 2025
            </span>
          </div>
        </div>
      </div>

      {/* === CỘT PHẢI: FORM AREA === */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 lg:px-24 bg-white relative">
        {/* Nút quay lại trang chủ */}
        <Link
          to="/"
          className="absolute top-8 left-8 flex items-center gap-2 text-slate-500 hover:text-primary transition-colors group text-sm font-medium"
        >
          <ArrowLeft
            size={18}
            className="group-hover:-translate-x-1 transition-transform"
          />
          Trang chủ
        </Link>

        <div className="w-full max-w-md mx-auto">
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">{title}</h1>
            <p className="text-slate-500">{subtitle}</p>
          </div>

          {/* Nội dung form sẽ được chèn vào đây */}
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
