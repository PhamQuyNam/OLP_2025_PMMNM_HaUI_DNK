import { Outlet, NavLink, Link } from "react-router-dom";
import {
  Map,
  Bell,
  FileText,
  BookOpen,
  ShieldAlert,
  UserCircle,
} from "lucide-react"; // Đổi User -> UserCircle, thêm BookOpen

const CitizenLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20 md:pb-0">
      {/* === HEADER === */}
      <header className="fixed top-0 w-full z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 md:px-8 py-3 flex items-center justify-between shadow-sm transition-all">
        {/* Logo & Brand */}
        <Link
          to="/"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <div className="bg-primary/10 p-1.5 rounded-lg">
            <ShieldAlert className="text-primary w-6 h-6" />
          </div>
          <h1 className="font-bold text-slate-800 text-lg hidden md:block">
            Viet Resilience Hub
          </h1>
          <h1 className="font-bold text-slate-800 text-lg md:hidden">
            VRH Citizen
          </h1>
        </Link>

        {/* === MENU DESKTOP (Giữ nguyên logic cũ) === */}
        <div className="hidden md:flex items-center gap-6">
          <DesktopNavLink to="/citizen" icon={Map} label="Bản đồ" end />
          <DesktopNavLink to="/citizen/alerts" icon={Bell} label="Cảnh báo" />
          <DesktopNavLink
            to="/citizen/report"
            icon={FileText}
            label="Gửi Báo cáo"
          />
          <DesktopNavLink
            to="/citizen/guide"
            icon={BookOpen}
            label="Cẩm nang"
          />{" "}
          {/* Mục mới */}
          {/* Nút SOS Desktop */}
          <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full font-bold shadow-lg shadow-red-200 flex items-center gap-2 transition-transform hover:scale-105 ml-4">
            <ShieldAlert size={18} /> SOS Khẩn cấp
          </button>
          {/* Avatar Profile trên Desktop */}
          <Link
            to="/citizen/profile"
            className="ml-4 p-1 rounded-full hover:bg-slate-100 transition-colors"
          >
            <UserCircle size={32} className="text-slate-600" />
          </Link>
        </div>

        {/* === MOBILE HEADER RIGHT (Profile & Status) === */}
        <div className="md:hidden flex items-center gap-3">
          {/* Status Badge */}
          <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-2 py-1 rounded-lg text-[10px] font-bold border border-emerald-100 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            ONLINE
          </div>
          {/* Avatar Profile trên Mobile (Đưa từ dưới lên đây) */}
          <Link
            to="/citizen/profile"
            className="text-slate-500 hover:text-primary"
          >
            <UserCircle size={28} />
          </Link>
        </div>
      </header>

      {/* === NỘI DUNG CHÍNH === */}
      <main className="pt-16 h-full">
        <Outlet />
      </main>

      {/* === BOTTOM NAVIGATION (MOBILE) === */}
      <nav className="md:hidden fixed bottom-0 w-full bg-white border-t border-slate-200 z-50 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="flex justify-around items-center h-16 px-2">
          <MobileNavItem to="/citizen" icon={Map} label="Bản đồ" end />
          <MobileNavItem to="/citizen/alerts" icon={Bell} label="Cảnh báo" />

          {/* Nút SOS (Vẫn giữ trung tâm) */}
          <div className="relative -top-5">
            <button className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-full shadow-xl shadow-red-500/40 flex items-center justify-center border-4 border-slate-50 text-white animate-bounce-slow active:scale-95 transition-transform">
              <span className="font-black text-xs tracking-tighter">SOS</span>
            </button>
          </div>

          <MobileNavItem to="/citizen/report" icon={FileText} label="Báo cáo" />
          {/* THAY THẾ: Profile -> Cẩm nang (Guide) */}
          <MobileNavItem to="/citizen/guide" icon={BookOpen} label="Cẩm nang" />
        </div>
      </nav>
    </div>
  );
};

// Component Link Desktop
const DesktopNavLink = ({ to, icon: Icon, label, end }) => (
  <NavLink
    to={to}
    end={end}
    className={({ isActive }) =>
      `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
        isActive
          ? "bg-primary/10 text-primary"
          : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
      }`
    }
  >
    <Icon size={18} /> {label}
  </NavLink>
);

// Component Link Mobile
const MobileNavItem = ({ to, icon: Icon, label, end }) => (
  <NavLink
    to={to}
    end={end}
    className={({ isActive }) =>
      `flex flex-col items-center justify-center w-full h-full gap-1 ${
        isActive ? "text-primary" : "text-slate-400 hover:text-slate-600"
      } transition-colors`
    }
  >
    {({ isActive }) => (
      <>
        <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
        <span className="text-[10px] font-medium">{label}</span>
      </>
    )}
  </NavLink>
);

export default CitizenLayout;
