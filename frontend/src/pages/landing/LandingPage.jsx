import { Link } from "react-router-dom";
import {
  Map,
  BellRing,
  Database,
  ArrowRight,
  Shield,
  Umbrella,
  ShieldAlert,
} from "lucide-react";
import Navbar from "../../components/common/Navbar";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <Navbar />

      {/* === HERO SECTION === */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-50 to-white -z-10" />
        {/* Decorative blobs */}
        <div className="absolute top-20 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-danger/10 rounded-full blur-3xl -z-10" />

        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-100 text-primary font-semibold text-sm mb-6 animate-fade-in-up">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
            </span>
            Hệ thống Cảnh báo Thiên tai Thời gian thực
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-slate-900 mb-6 tracking-tight">
            Chủ động <span className="text-primary">Ứng phó</span> <br />
            An toàn <span className="text-danger">Trước Thiên Tai</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            Nền tảng dữ liệu mở (Open Data) giúp cảnh báo sớm sạt lở, lũ lụt và
            kết nối người dân với chính quyền trong tình huống khẩn cấp.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/citizen"
              className="flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white rounded-xl font-bold text-lg hover:bg-sky-600 transition-all shadow-xl hover:shadow-sky-200 transform hover:-translate-y-1"
            >
              <Umbrella size={24} />
              Dành cho Người Dân
            </Link>
            <Link
              to="/manager"
              className="flex items-center justify-center gap-2 px-8 py-4 bg-white text-slate-700 border-2 border-slate-200 rounded-xl font-bold text-lg hover:border-primary hover:text-primary transition-all transform hover:-translate-y-1"
            >
              <Shield size={24} />
              Dành cho Quản Lý
            </Link>
          </div>
        </div>
      </section>

      {/* === FEATURES SECTION === */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Công nghệ Tiên phong
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto">
              Sử dụng tiêu chuẩn NGSI-LD và dữ liệu mở liên kết để tạo nên sức
              mạnh dự báo.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 rounded-2xl bg-slate-50 hover:bg-sky-50 transition-colors group border border-slate-100">
              <div className="w-14 h-14 bg-blue-100 text-primary rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Map size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3">Bản đồ Rủi ro Động</h3>
              <p className="text-slate-600">
                Trực quan hóa vùng nguy cơ sạt lở và ngập lụt dựa trên dữ liệu
                địa hình và lượng mưa thời gian thực.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-2xl bg-slate-50 hover:bg-red-50 transition-colors group border border-slate-100">
              <div className="w-14 h-14 bg-red-100 text-danger rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BellRing size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3">Cảnh báo Tức thời</h3>
              <p className="text-slate-600">
                Gửi thông báo SOS và chỉ dẫn sơ tán đến điện thoại người dân
                ngay khi các chỉ số vượt ngưỡng an toàn.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-2xl bg-slate-50 hover:bg-emerald-50 transition-colors group border border-slate-100">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Database size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3">Dữ liệu Mở Liên kết</h3>
              <p className="text-slate-600">
                Tích hợp đa nguồn dữ liệu (OpenWeather, IoT, Crowdsourcing) theo
                chuẩn quốc tế NGSI-LD.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* === FOOTER === */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4 text-white">
            <ShieldAlert className="w-8 h-8" />
            <span className="text-2xl font-bold">Viet Resilience Hub</span>
          </div>
          <p className="mb-8">
            Giải pháp Công nghệ cho Thành phố Thông minh & An toàn
          </p>
          <div className="border-t border-slate-800 pt-8 text-sm">
            &copy; 2025 Team Haui-DNK. OLP Tin học Sinh viên Việt Nam.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
