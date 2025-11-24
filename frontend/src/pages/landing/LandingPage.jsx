import { Link } from "react-router-dom";
import {
  Map,
  BellRing,
  Database,
  Shield,
  Umbrella,
  Activity,
  ArrowRight,
  CheckCircle2,
  Zap,
  ChevronDown,
  ShieldCheck,
} from "lucide-react";
import Navbar from "../../components/common/Navbar";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-zinc-100 font-sans text-slate-800 overflow-x-hidden selection:bg-primary/30">
      <Navbar />

      {/* === HERO SECTION === */}
      <section className="relative pt-32 pb-16 lg:pt-48 lg:pb-20 overflow-hidden">
        {/* Grid Pattern & Ambient Light (Giữ nguyên vì đã đẹp) */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#94a3b820_1px,transparent_1px),linear-gradient(to_bottom,#94a3b820_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/10 rounded-full blur-[120px] -z-10" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            {/* === 1. BADGE OLP (ĐÃ SỬA: CÓ HIỆU ỨNG ĐỘNG) === */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-300 shadow-sm mb-8 animate-fade-in-up hover:border-primary/50 transition-colors cursor-default select-none">
              {/* Hiệu ứng Ping (Nhịp tim) quay trở lại */}
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-bold text-slate-600 tracking-wider uppercase">
                Giải pháp OLP 2025 • Running
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-slate-900 mb-6 tracking-tight leading-[1.1]">
              Cảnh Báo{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-700">
                Thông Minh
              </span>{" "}
              <br />
              Ứng Phó{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-danger to-rose-600">
                Thiên Tai
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-10 font-medium">
              Hệ thống giám sát thời gian thực dựa trên{" "}
              <span className="font-bold text-slate-800 bg-white/50 px-2 py-0.5 rounded border border-slate-200">
                Dữ liệu mở Liên kết
              </span>
              . Bảo vệ cộng đồng trước nguy cơ sạt lở và lũ quét.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-5 items-center mb-16">
              <Link to="/citizen" className="group relative w-full sm:w-auto">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-sky-400 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-200"></div>
                <div className="relative px-8 py-4 bg-primary rounded-2xl text-white font-bold text-lg flex items-center justify-center gap-3 shadow-xl transition-transform transform group-hover:-translate-y-1 active:translate-y-0">
                  <Umbrella className="w-6 h-6" />
                  <span>Dành cho Người Dân</span>
                  <ArrowRight className="w-5 h-5 opacity-70 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              <Link
                to="/manager"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-lg text-slate-700 bg-white border-2 border-slate-200 hover:border-primary hover:text-primary hover:shadow-lg transition-all flex items-center justify-center gap-3"
              >
                <Activity className="w-6 h-6" />
                <span>Dashboard Quản Lý</span>
              </Link>
            </div>
            {/* --- START: GLASS MOCKUP (DASHBOARD ẢO) --- */}
            <div className="mt-16 mb-8 relative z-20 max-w-4xl mx-auto animate-float hidden lg:block">
              {/* Viền phát sáng (Glow Effect) */}
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-indigo-600 rounded-2xl blur opacity-20"></div>

              {/* Khung kính chính */}
              <div className="relative rounded-2xl bg-slate-900/5 backdrop-blur-sm border border-white/20 shadow-2xl overflow-hidden">
                {/* Thanh tiêu đề giả lập trình duyệt */}
                <div className="h-8 bg-white/70 backdrop-blur-md border-b border-white/30 flex items-center px-4 gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  <div className="ml-4 px-3 py-0.5 bg-white/50 rounded-md text-[10px] text-slate-500 font-mono">
                    dashboard.viet-resilience.vn
                  </div>
                </div>

                {/* Nội dung bên trong (Mô phỏng Dashboard) */}
                <div className="aspect-[16/9] bg-slate-900 relative overflow-hidden">
                  {/* Grid map background */}
                  <div className="absolute inset-0 opacity-30 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:40px_40px]"></div>

                  {/* Các Widget giả lập (Vẽ bằng CSS) */}
                  <div className="absolute top-8 left-8 w-48 h-32 bg-slate-800/80 rounded-xl border border-slate-700/50 p-4 animate-pulse">
                    <div className="h-2 w-20 bg-slate-600 rounded mb-2"></div>
                    <div className="h-8 w-12 bg-emerald-500/20 text-emerald-400 rounded flex items-center justify-center text-sm font-bold mb-2">
                      Safe
                    </div>
                    <div className="h-2 w-32 bg-slate-700 rounded"></div>
                  </div>

                  <div className="absolute bottom-8 right-8 w-64 h-40 bg-slate-800/80 rounded-xl border border-slate-700/50 p-4">
                    <div className="flex gap-2 items-end h-full pb-2">
                      <div className="flex-1 bg-indigo-500/30 rounded-t-lg h-[40%]"></div>
                      <div className="flex-1 bg-indigo-500/60 rounded-t-lg h-[70%]"></div>
                      <div className="flex-1 bg-indigo-500 rounded-t-lg h-[50%]"></div>
                      <div className="flex-1 bg-indigo-500/40 rounded-t-lg h-[80%]"></div>
                    </div>
                  </div>

                  {/* Điểm cảnh báo đỏ giữa màn hình */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <span className="relative flex h-6 w-6">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-6 w-6 bg-red-500 border-2 border-white shadow-lg shadow-red-500/50"></span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
            {/* --- END: GLASS MOCKUP --- */}
            {/* Scroll Indicator */}
            <div className="animate-bounce text-slate-400 flex justify-center opacity-50">
              <ChevronDown size={32} />
            </div>
          </div>
        </div>
      </section>

      {/* === FEATURES SECTION === */}
      <section id="features" className="py-20 bg-white relative">
        {/* Curve Divider */}
        <div className="absolute top-0 left-0 w-full overflow-hidden leading-none rotate-180">
          <svg
            className="relative block w-[calc(100%+1.3px)] h-[60px]"
            data-name="Layer 1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path
              d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
              className="fill-zinc-100"
            ></path>
          </svg>
        </div>

        <div className="container mx-auto px-4 pt-10">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Cột trái: Tiêu đề & Mô tả */}
            <div className="lg:col-span-4 lg:sticky lg:top-32 self-start">
              <div className="inline-flex items-center gap-2 text-primary font-bold uppercase tracking-wider text-sm mb-4">
                <Zap size={16} /> Công nghệ Lõi
              </div>
              <h2 className="text-4xl font-bold text-slate-900 mb-6 leading-tight">
                Sức mạnh từ <br />{" "}
                <span className="text-primary">Tiêu chuẩn Mở</span>
              </h2>
              <p className="text-slate-600 text-lg mb-8 leading-relaxed">
                Chúng tôi không chỉ xây dựng ứng dụng, chúng tôi kiến tạo một hạ
                tầng dữ liệu bền vững theo tiêu chuẩn quốc tế{" "}
                <strong>NGSI-LD</strong> và <strong>SOSA/SSN</strong>.
              </p>

              {/* === 2. ĐÃ SỬA: FOOTER NHỎ GỌN, BỎ DEV DEV DEV === */}
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="bg-white p-2 rounded-full shadow-sm text-emerald-500">
                  <ShieldCheck size={24} />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-400 uppercase">
                    Phát triển bởi
                  </span>
                  <span className="font-bold text-slate-800">
                    Team Haui-DNK
                  </span>
                </div>
              </div>
            </div>

            {/* Cột phải: Các thẻ tính năng (Cards) */}
            <div className="lg:col-span-8 grid sm:grid-cols-2 gap-6">
              {/* Card 1 */}
              <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 hover:border-sky-200 hover:shadow-xl hover:shadow-sky-100/50 transition-all group">
                <div className="w-14 h-14 bg-sky-500 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-sky-200 group-hover:scale-110 transition-transform">
                  <Map size={28} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">
                  Bản đồ Rủi ro Động
                </h3>
                <p className="text-slate-600">
                  Tích hợp lớp dữ liệu địa hình (PostGIS) và lượng mưa thời gian
                  thực để khoanh vùng nguy hiểm.
                </p>
              </div>

              {/* Card 2 */}
              <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 hover:border-red-200 hover:shadow-xl hover:shadow-red-100/50 transition-all group sm:translate-y-8">
                <div className="w-14 h-14 bg-red-500 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-red-200 group-hover:scale-110 transition-transform">
                  <BellRing size={28} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">
                  Cảnh báo Đa kênh
                </h3>
                <p className="text-slate-600">
                  Hệ thống tự động kích hoạt SOS và gửi chỉ dẫn sơ tán đến App
                  người dân khi chỉ số vượt ngưỡng.
                </p>
              </div>

              {/* Card 3 */}
              <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-100/50 transition-all group">
                <div className="w-14 h-14 bg-emerald-500 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-200 group-hover:scale-110 transition-transform">
                  <Database size={28} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">
                  Dữ liệu Mở Liên kết
                </h3>
                <p className="text-slate-600">
                  Chuẩn hóa dữ liệu từ OpenWeather, IoT và cộng đồng thành đồ
                  thị tri thức (Knowledge Graph).
                </p>
              </div>

              {/* Card 4 */}
              <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 hover:border-violet-200 hover:shadow-xl hover:shadow-violet-100/50 transition-all group sm:translate-y-8">
                <div className="w-14 h-14 bg-violet-500 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-violet-200 group-hover:scale-110 transition-transform">
                  <Activity size={28} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">
                  Phân tích & Dự báo
                </h3>
                <p className="text-slate-600">
                  Sử dụng thuật toán học máy (Machine Learning) để dự đoán xu
                  hướng ngập lụt cục bộ.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* === FOOTER === */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-6 text-white opacity-90">
            <Shield className="w-10 h-10" />
            <span className="text-3xl font-bold tracking-tight">
              Viet Resilience Hub
            </span>
          </div>
          <p className="mb-8 text-lg">
            Giải pháp Công nghệ cho Thành phố Thông minh & An toàn
          </p>
          <div className="border-t border-slate-800 pt-8 text-sm flex flex-col md:flex-row justify-center gap-6 font-medium">
            <span>&copy; 2025 Team Haui-DNK</span>
            <span className="hidden md:inline text-slate-700">•</span>
            <span>OLP Tin học Sinh viên Việt Nam</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
