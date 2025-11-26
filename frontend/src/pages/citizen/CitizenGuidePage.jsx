import { useState } from "react";
import {
  BookOpen,
  Phone,
  LifeBuoy,
  ChevronRight,
  Search,
  Flame,
  Droplets,
  Zap,
  Info,
} from "lucide-react";

const CitizenGuidePage = () => {
  const [activeTab, setActiveTab] = useState("skills"); // skills | news | contacts

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {" "}
      {/* Padding bottom để không bị menu che */}
      {/* Header Page */}
      <div className="bg-white px-4 py-6 border-b border-slate-100 sticky top-16 z-30">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">
          Cẩm nang An toàn
        </h1>
        <p className="text-sm text-slate-500 mb-4">
          Kiến thức sinh tồn và thông tin cứu hộ Hà Tĩnh.
        </p>

        {/* Search Bar */}
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Tìm kiếm kỹ năng (VD: Lũ lụt...)"
            className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none"
          />
        </div>
      </div>
      {/* Tabs Navigation */}
      <div className="flex gap-2 px-4 py-4 overflow-x-auto no-scrollbar sticky top-[140px] bg-slate-50 z-20">
        <TabButton
          active={activeTab === "skills"}
          onClick={() => setActiveTab("skills")}
          icon={LifeBuoy}
          label="Kỹ năng"
        />
        <TabButton
          active={activeTab === "contacts"}
          onClick={() => setActiveTab("contacts")}
          icon={Phone}
          label="Số khẩn cấp"
        />
        <TabButton
          active={activeTab === "news"}
          onClick={() => setActiveTab("news")}
          icon={Info}
          label="Tin tức"
        />
      </div>
      {/* Content Area */}
      <div className="px-4 space-y-4 animate-fade-in-up">
        {/* === TAB 1: KỸ NĂNG SINH TỒN === */}
        {activeTab === "skills" && (
          <div className="grid gap-4">
            <SkillCard
              icon={Droplets}
              color="blue"
              title="Ứng phó Lũ lụt"
              desc="Cách kê cao đồ đạc, ngắt điện và chuẩn bị túi sơ tán khẩn cấp."
            />
            <SkillCard
              icon={Flame}
              color="orange"
              title="Sạt lở đất"
              desc="Nhận biết dấu hiệu vết nứt, tiếng động lạ và hướng chạy thoát hiểm."
            />
            <SkillCard
              icon={Zap}
              color="yellow"
              title="An toàn điện mùa mưa"
              desc="Quy tắc vàng để tránh bị điện giật khi nước dâng cao."
            />

            {/* Video Mockup */}
            <div className="mt-6">
              <h3 className="font-bold text-slate-800 mb-3">Video hướng dẫn</h3>
              <div className="aspect-video bg-slate-800 rounded-xl flex items-center justify-center relative overflow-hidden group cursor-pointer shadow-lg">
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all"></div>
                <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center border-2 border-white z-10">
                  <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[14px] border-l-white border-b-[8px] border-b-transparent ml-1"></div>
                </div>
                <span className="absolute bottom-3 left-3 text-white text-xs font-medium px-2 py-1 bg-black/60 rounded">
                  05:20 • Sơ cấp cứu đuối nước
                </span>
              </div>
            </div>
          </div>
        )}

        {/* === TAB 2: SỐ KHẨN CẤP === */}
        {activeTab === "contacts" && (
          <div className="space-y-3">
            <ContactCard
              name="Cứu hộ Hà Tĩnh"
              phone="0239 385 112"
              type="rescue"
            />
            <ContactCard name="Công an Tỉnh" phone="113" type="police" />
            <ContactCard name="Cấp cứu Y tế" phone="115" type="medical" />
            <ContactCard
              name="Điện lực Hà Tĩnh"
              phone="1900 6769"
              type="electric"
            />
          </div>
        )}

        {/* === TAB 3: TIN TỨC === */}
        {activeTab === "news" && (
          <div className="space-y-4">
            <NewsCard
              date="10 phút trước"
              title="Thông báo xả lũ Hồ Kẻ Gỗ đợt 2"
              summary="Dự kiến mực nước hạ lưu sông Rào Cái sẽ dâng thêm 0.5m. Người dân vùng Cẩm Xuyên cần chú ý."
              tag="Khẩn cấp"
            />
            <NewsCard
              date="2 giờ trước"
              title="Dự báo thời tiết Hà Tĩnh 24h tới"
              summary="Mưa lớn diện rộng, nguy cơ sạt lở đất tại Hương Sơn, Vũ Quang."
              tag="Dự báo"
            />
          </div>
        )}
      </div>
    </div>
  );
};

// --- SUB-COMPONENTS ---
const TabButton = ({ active, onClick, icon: Icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
      active
        ? "bg-primary text-white shadow-md shadow-primary/30"
        : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
    }`}
  >
    <Icon size={16} /> {label}
  </button>
);

const SkillCard = ({ icon: Icon, color, title, desc }) => {
  const colors = {
    blue: "bg-blue-100 text-blue-600",
    orange: "bg-orange-100 text-orange-600",
    yellow: "bg-yellow-100 text-yellow-600",
  };
  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-start gap-4 hover:shadow-md transition-all cursor-pointer group">
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${colors[color]}`}
      >
        <Icon size={24} />
      </div>
      <div className="flex-1">
        <h3 className="font-bold text-slate-800 mb-1 group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
          {desc}
        </p>
      </div>
      <ChevronRight className="text-slate-300 self-center" size={20} />
    </div>
  );
};

const ContactCard = ({ name, phone, type }) => {
  const types = {
    rescue: { icon: LifeBuoy, bg: "bg-orange-500" },
    police: { icon: ShieldButton, bg: "bg-blue-600" },
    medical: { icon: BookOpen, bg: "bg-red-500" },
    electric: { icon: Zap, bg: "bg-yellow-500" },
  };
  const config = types[type] || types.rescue;
  const ShieldButton = config.icon || LifeBuoy; // Fallback
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${config.bg}`}
        >
          <ShieldButton size={20} />
        </div>
        <div>
          <h3 className="font-bold text-slate-800">{name}</h3>
          <p className="text-xs text-slate-500">Hỗ trợ 24/7</p>
        </div>
      </div>
      <a
        href={`tel:${phone}`}
        className="bg-slate-100 hover:bg-primary hover:text-white text-slate-900 font-bold px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2"
      >
        <Phone size={14} /> {phone}
      </a>
    </div>
  );
};

const NewsCard = ({ date, title, summary, tag }) => (
  <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
    <div className="flex items-center justify-between mb-2">
      <span className="text-[10px] font-bold text-slate-400 uppercase">
        {date}
      </span>
      <span
        className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
          tag === "Khẩn cấp"
            ? "bg-red-50 text-red-600 border-red-100"
            : "bg-sky-50 text-sky-600 border-sky-100"
        }`}
      >
        {tag}
      </span>
    </div>
    <h3 className="font-bold text-slate-800 mb-1 leading-tight">{title}</h3>
    <p className="text-xs text-slate-500 leading-relaxed">{summary}</p>
  </div>
);

export default CitizenGuidePage;
