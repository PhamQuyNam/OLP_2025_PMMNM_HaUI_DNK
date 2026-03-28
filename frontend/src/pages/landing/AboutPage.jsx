import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Users, Target, ShieldCheck } from "lucide-react";
import Navbar from "../../components/common/Navbar";

const AboutPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-zinc-100 font-sans text-slate-800">
      <Navbar />
      
      <div className="pt-32 pb-20 container mx-auto px-4 max-w-4xl">
        <Link to="/" className="inline-flex items-center gap-2 text-primary hover:text-sky-600 font-semibold mb-8 transition-colors">
          <ArrowLeft size={20} />
          Trở về Trang chủ
        </Link>

        <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">Về Dự Án</h1>
        
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-slate-200 mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Target className="w-8 h-8 text-primary" />
            <h2 className="text-2xl font-bold text-slate-800">Tầm Nhìn & Sứ Mệnh</h2>
          </div>
          <p className="text-lg text-slate-600 leading-relaxed mb-6">
            Viet Resilience Hub được sinh ra từ nhu cầu thực tiễn về một nền tảng quản lý rủi ro thiên tai hiện đại, có khả năng phản ứng nhanh theo thời gian thực.
            Sứ mệnh của dự án là áp dụng sức mạnh công nghệ thông tin – đặc biệt là Dữ liệu mở, Hệ thống thông tin địa lý (GIS) và Phân tích đa tham số – để bảo vệ sinh mạng và tài sản cộng đồng.
          </p>
          <p className="text-lg text-slate-600 leading-relaxed">
            Chúng tôi tin rằng việc ứng dụng tiêu chuẩn dữ liệu NGSI-LD sẽ mở ra một hệ sinh thái thông tin liền mạch, cho phép các cấp chính quyền và người dân phối hợp hiệu quả trong công tác phòng chống và ứng phó thiên tai.
          </p>
        </div>

        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4 mb-6">
            <Users className="w-8 h-8 text-emerald-500" />
            <h2 className="text-2xl font-bold text-slate-800">Đội ngũ Phát triển</h2>
          </div>
          <div className="flex items-center gap-4 p-6 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="bg-white p-4 rounded-full shadow-sm text-emerald-500">
              <ShieldCheck size={32} />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">
                Phát triển bởi
              </span>
              <span className="text-2xl font-black text-slate-800">
                YM_Tech
              </span>
              <span className="text-slate-500 mt-1">
                Cuộc thi Sáng tạo Thanh, Thiếu niên và Nhi đồng xã Yên Mô lần thứ I năm 2026
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
