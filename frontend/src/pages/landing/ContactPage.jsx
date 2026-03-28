import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail, Phone, MapPin, Send } from "lucide-react";
import Navbar from "../../components/common/Navbar";

const ContactPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-zinc-100 font-sans text-slate-800">
      <Navbar />
      
      <div className="pt-32 pb-20 container mx-auto px-4 max-w-6xl">
        <Link to="/" className="inline-flex items-center gap-2 text-primary hover:text-sky-600 font-semibold mb-8 transition-colors">
          <ArrowLeft size={20} />
          Trở về Trang chủ
        </Link>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Cột Thông tin */}
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">Liên Hệ</h1>
            <p className="text-lg text-slate-600 mb-10">
              Hãy liên hệ với chúng tôi để tìm hiểu thêm về nền tảng Viet Resilience Hub hoặc hợp tác triển khai dự án. Đội ngũ YM_Tech luôn sẵn sàng lắng nghe bạn!
            </p>

            <div className="space-y-6">
              <div className="flex items-start gap-4 p-6 bg-white rounded-2xl shadow-sm border border-slate-200">
                <div className="w-12 h-12 bg-sky-100 text-sky-600 rounded-xl flex items-center justify-center shrink-0">
                  <Mail size={24} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Email</h4>
                  <p className="text-lg font-semibold text-slate-800">c2khanhthinhyenmo.ninhbinh@moet.edu.vn</p>
                  <p className="text-sm text-slate-500 mt-1">Phản hồi trong vòng 24h</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-6 bg-white rounded-2xl shadow-sm border border-slate-200">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                  <Phone size={24} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Điện thoại</h4>
                  <p className="text-lg font-semibold text-slate-800">091 583 4298</p>
                  <p className="text-sm text-slate-500 mt-1">Hỗ trợ giờ hành chính</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-6 bg-white rounded-2xl shadow-sm border border-slate-200">
                <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center shrink-0">
                  <MapPin size={24} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Địa chỉ</h4>
                  <p className="text-lg font-semibold text-slate-800">Yên Mô, Ninh Bình, Việt Nam</p>
                </div>
              </div>
            </div>
          </div>

          {/* Cột Form */}
          <div className="bg-white p-8 md:p-10 rounded-3xl shadow-lg border border-slate-200 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-sky-400"></div>
            <h2 className="text-2xl font-bold text-slate-800 mb-8">Gửi lời nhắn</h2>
            
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Họ và tên</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all bg-slate-50"
                  placeholder="Nguyễn Văn A"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Email</label>
                <input 
                  type="email" 
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all bg-slate-50"
                  placeholder="email@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Nội dung</label>
                <textarea 
                  rows="4"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all bg-slate-50 resize-none"
                  placeholder="Nhập nội dung tin nhắn của bạn..."
                ></textarea>
              </div>

              <button className="w-full py-4 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold flex justify-center items-center gap-2 transition-colors">
                <Send size={18} />
                Gửi Tin Nhắn
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
