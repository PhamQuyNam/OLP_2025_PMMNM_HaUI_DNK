import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Zap, Map, BellRing, Database, Activity } from "lucide-react";
import Navbar from "../../components/common/Navbar";

const FeaturesPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-zinc-100 font-sans text-slate-800">
      <Navbar />
      
      <div className="pt-32 pb-20 container mx-auto px-4 max-w-5xl">
        <Link to="/" className="inline-flex items-center gap-2 text-primary hover:text-sky-600 font-semibold mb-8 transition-colors">
          <ArrowLeft size={20} />
          Trở về Trang chủ
        </Link>

        <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">Tính Năng Nổi Bật</h1>
        <p className="text-lg text-slate-600 mb-12 max-w-3xl">
          Khám phá chi tiết các tính năng cốt lõi của hệ thống Viet Resilience Hub, được thiết kế chuyên biệt để nâng cao năng lực ứng phó và cảnh báo thiên tai.
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 hover:shadow-lg transition-shadow">
            <div className="w-14 h-14 bg-sky-100 text-sky-600 rounded-2xl flex items-center justify-center mb-6">
              <Map size={28} />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-4">Bản đồ Nguy cơ Số</h3>
            <p className="text-slate-600 leading-relaxed">
              Trực quan hóa các "điểm nóng" có nguy cơ lũ quét và sạt lở cao trên nền tảng bản đồ PostGIS, giúp khoanh vùng nguy hiểm trực quan. Cung cấp cái nhìn tổng quan theo thời gian thực về tình hình thiên tai tại các khu vực dễ bị tổn thương.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 hover:shadow-lg transition-shadow">
            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mb-6">
              <BellRing size={28} />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-4">Cảnh báo Đa phương thức</h3>
            <p className="text-slate-600 leading-relaxed">
              Tự động kích hoạt thông báo khẩn cấp và lộ trình sơ tán an toàn tới người dân ngay khi phát hiện chỉ số quan trắc vượt ngưỡng. Hỗ trợ đa dạng các kênh từ ứng dụng di động, tin nhắn, cho đến hiển thị trực tiếp trên Dashboard quản lý.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 hover:shadow-lg transition-shadow">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
              <Database size={28} />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-4">Hệ sinh thái Dữ liệu Mở</h3>
            <p className="text-slate-600 leading-relaxed">
              Chuẩn hóa và tích hợp nguồn tin từ trạm quan trắc IoT, dữ liệu thời tiết vệ tinh và cộng đồng theo tiêu chuẩn FIWARE (NGSI-LD). Đảm bảo tính minh bạch, nhất quán và sẵn sàng để liên kết vớ các hệ thống hành chính công.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 hover:shadow-lg transition-shadow">
            <div className="w-14 h-14 bg-violet-100 text-violet-600 rounded-2xl flex items-center justify-center mb-6">
              <Activity size={28} />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-4">Phân tích Đa tham số</h3>
            <p className="text-slate-600 leading-relaxed">
              Đánh giá rủi ro dựa trên sự kết hợp dữ liệu mưa thời gian thực, độ dốc địa hình và các chỉ số thủy văn (TWI, Slope) để đưa ra cảnh báo chính xác. Thuật toán phân tích linh hoạt có thể tùy chỉnh dễ dàng theo từng địa phương.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturesPage;
