import { useState } from "react";
import {
  Droplets, // Lũ lụt
  Mountain, // Sạt lở (Thay cho Flame nhìn hợp lý hơn)
  Zap, // Điện
  HeartPulse, // Sơ cấp cứu (Mới)
  Briefcase, // Túi khẩn cấp (Mới)
  Sparkles, // Vệ sinh môi trường (Mới)
  ChevronDown,
  ShieldCheck,
} from "lucide-react";

const CitizenGuidePage = () => {
  // State để lưu ID của thẻ đang mở (null = đóng hết)
  const [expandedId, setExpandedId] = useState(null);

  // Hàm xử lý bấm vào thẻ
  const toggleCard = (id) => {
    if (expandedId === id) {
      setExpandedId(null); // Bấm lại thì đóng
    } else {
      setExpandedId(id); // Bấm cái mới thì mở cái mới
    }
  };

  // Dữ liệu danh sách kỹ năng (6 Kỹ năng chuẩn OLP)
  const GUIDES = [
    {
      id: 1,
      title: "Ứng phó Lũ lụt & Ngập úng",
      icon: Droplets,
      color: "bg-blue-100 text-blue-600",
      content:
        "Text: Hướng dẫn kê cao đồ đạc, ngắt cầu dao điện. Tìm nơi cao ráo để trú ẩn. Không lội qua dòng nước chảy xiết.",
    },
    {
      id: 2,
      title: "Nhận biết & Phòng tránh Sạt lở",
      icon: Mountain,
      color: "bg-orange-100 text-orange-600",
      content:
        "Text: Quan sát các vết nứt trên tường, sườn đồi. Lắng nghe tiếng động lạ từ lòng đất. Di dời ngay khi thấy dòng nước đục ngầu.",
    },
    {
      id: 3,
      title: "An toàn điện mùa mưa bão",
      icon: Zap,
      color: "bg-yellow-100 text-yellow-600",
      content:
        "Text: Không đứng dưới cột điện, cây to khi mưa. Ngắt nguồn điện khi nước dâng vào nhà. Không chạm vào thiết bị điện khi tay ướt.",
    },
    {
      id: 4,
      title: "Sơ cấp cứu đuối nước cơ bản",
      icon: HeartPulse,
      color: "bg-red-100 text-red-600",
      content:
        "Text: Cách vớt người bị nạn an toàn. Kỹ thuật ép tim lồng ngực (CPR) và hà hơi thổi ngạt. Giữ ấm cơ thể nạn nhân.",
    },
    {
      id: 5,
      title: "Chuẩn bị Túi khẩn cấp (Go-bag)",
      icon: Briefcase,
      color: "bg-emerald-100 text-emerald-600",
      content:
        "Text: Danh sách vật dụng cần thiết: Đèn pin, pin dự phòng, nước uống, lương khô, thuốc men, giấy tờ tùy thân bọc nilon.",
    },
    {
      id: 6,
      title: "Vệ sinh & Phòng dịch sau lũ",
      icon: Sparkles,
      color: "bg-cyan-100 text-cyan-600",
      content:
        "Text: Cách xử lý nguồn nước uống sạch. Vệ sinh nhà cửa bằng Cloramin B. Phòng tránh các bệnh da liễu và tiêu hóa.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* === HEADER (Gọn gàng) === */}
      <div className="bg-white px-6 py-8 border-b border-slate-100 sticky top-16 z-30 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-primary/10 p-2 rounded-lg">
            <ShieldCheck className="text-primary w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">
            Cẩm nang An toàn
          </h1>
        </div>
        <p className="text-slate-500 text-sm font-medium pl-1">
          Kiến thức sinh tồn thiết yếu cho người dân vùng thiên tai.
        </p>
      </div>

      {/* === GRID CONTENT === */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in-up">
          {GUIDES.map((guide) => (
            <div
              key={guide.id}
              onClick={() => toggleCard(guide.id)}
              className={`
                bg-white rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden group
                ${
                  expandedId === guide.id
                    ? "border-primary shadow-md ring-1 ring-primary/20"
                    : "border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200"
                }
              `}
            >
              {/* Card Header (Luôn hiện) */}
              <div className="p-5 flex items-center gap-4">
                {/* Icon Box */}
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${guide.color} group-hover:scale-110 transition-transform duration-300`}
                >
                  <guide.icon size={24} strokeWidth={2.5} />
                </div>

                {/* Title */}
                <div className="flex-1">
                  <h3
                    className={`font-bold text-base transition-colors ${
                      expandedId === guide.id
                        ? "text-primary"
                        : "text-slate-800"
                    }`}
                  >
                    {guide.title}
                  </h3>
                </div>

                {/* Arrow Icon (Xoay khi mở) */}
                <div
                  className={`text-slate-400 transition-transform duration-300 ${
                    expandedId === guide.id ? "rotate-180 text-primary" : ""
                  }`}
                >
                  <ChevronDown size={20} />
                </div>
              </div>

              {/* Card Body (Nội dung trượt xuống) */}
              <div
                className={`
                  transition-all duration-300 ease-in-out overflow-hidden bg-slate-50/50
                  ${
                    expandedId === guide.id
                      ? "max-h-[1000px] opacity-100"
                      : "max-h-0 opacity-0"
                  }
                `}
              >
                <div className="p-5 pt-0 text-sm text-slate-600 leading-relaxed border-t border-slate-100/50 mt-2">
                  <div className="pt-4 whitespace-pre-line">
                    {guide.content}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CitizenGuidePage;
