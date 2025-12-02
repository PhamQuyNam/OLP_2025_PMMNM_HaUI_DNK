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

  // Dữ liệu danh sách kỹ năng (Nội dung chuẩn hóa chi tiết)
  const GUIDES = [
    {
      id: 1,
      title: "Ứng phó Lũ lụt & Ngập úng",
      icon: Droplets,
      color: "bg-blue-100 text-blue-600",
      content:
        "• Ngắt ngay cầu dao điện tổng của cả nhà.\n• Kê cao đồ đạc, lương thực, nước uống và các vật dụng thiết yếu.\n• Di chuyển người già, trẻ em, người khuyết tật đến nơi cao ráo, an toàn.\n• Không lội qua dòng nước chảy xiết (nước ngập trên đầu gối là nguy hiểm).\n• Không lái xe máy/ô tô vào vùng ngập sâu không rõ địa hình.\n• Theo dõi sát thông báo sơ tán trên ứng dụng này.",
    },
    {
      id: 2,
      title: "Nhận biết & Phòng tránh Sạt lở",
      icon: Mountain,
      color: "bg-orange-100 text-orange-600",
      content:
        "• Quan sát: Vết nứt mới xuất hiện trên tường nhà, sườn đồi, mái dốc.\n• Dấu hiệu: Cửa ra vào hoặc cửa sổ bị kẹt, khó đóng mở (do đất nền chuyển động).\n• Nguồn nước: Nước suối hoặc nước giếng bỗng chuyển màu đục ngầu.\n• Âm thanh: Nghe tiếng ầm ì, rung chấn lạ từ lòng đất.\n• Hành động: Sơ tán NGAY LẬP TỨC khỏi vùng chân núi/đồi khi thấy dấu hiệu trên.",
    },
    {
      id: 3,
      title: "An toàn điện mùa mưa bão",
      icon: Zap,
      color: "bg-yellow-100 text-yellow-600",
      content:
        "• Khi nhà bị ngập: Ngắt ngay nguồn điện. Không chạm vào thiết bị điện khi tay ướt hoặc chân đứng trong nước.\n• Khi ở ngoài trời: Không đứng trú mưa dưới cột điện, trạm biến áp, cây to.\n• Khi thấy dây điện đứt: Tuyệt đối không lại gần (giữ khoảng cách tối thiểu 10m). Báo ngay cho điện lực hoặc qua nút SOS trên ứng dụng.",
    },
    {
      id: 4,
      title: "Sơ cấp cứu đuối nước cơ bản",
      icon: HeartPulse,
      color: "bg-red-100 text-red-600",
      content:
        "• Nguyên tắc 1: Không nhảy xuống cứu nếu không biết bơi/không có kỹ năng (hãy ném phao, gậy, dây).\n• Nguyên tắc 2: TUYỆT ĐỐI KHÔNG dốc ngược nạn nhân chạy (gây mất thời gian vàng).\n• Hô hấp nhân tạo: Đặt nạn nhân nằm ngửa, ấn tim lồng ngực và hà hơi thổi ngạt ngay lập tức nếu ngừng thở.\n• Giữ ấm: Cởi bỏ quần áo ướt, ủ ấm cơ thể và đưa đến trạm y tế gần nhất.",
    },
    {
      id: 5,
      title: "Chuẩn bị Túi khẩn cấp (Go-bag)",
      icon: Briefcase,
      color: "bg-emerald-100 text-emerald-600",
      content:
        "Chuẩn bị sẵn 1 túi chống nước gồm:\n• Nước uống (tối thiểu 3 lít/người) và lương khô/đồ hộp.\n• Đèn pin, pin dự phòng, còi cứu hộ, bật lửa.\n• Thuốc cá nhân, bông băng y tế, thuốc tiêu hóa.\n• Giấy tờ quan trọng (CCCD, Sổ đỏ...) bọc kỹ trong nhiều lớp nilon.\n• Một ít tiền mặt và quần áo khô.",
    },
    {
      id: 6,
      title: "Vệ sinh & Phòng dịch sau lũ",
      icon: Sparkles,
      color: "bg-cyan-100 text-cyan-600",
      content:
        "• Nước rút đến đâu, thau rửa nhà cửa đến đó.\n• Xử lý nước: Dùng viên Cloramin B hoặc phèn chua để làm trong nước trước khi dùng.\n• Ăn uống: Thực hiện ăn chín, uống sôi. Tuyệt đối không ăn gia súc/gia cầm chết do lũ.\n• Vệ sinh cá nhân: Rửa chân tay sạch sẽ để tránh bệnh nước ăn chân, ghẻ lở, đau mắt đỏ.",
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in-up items-start">
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
