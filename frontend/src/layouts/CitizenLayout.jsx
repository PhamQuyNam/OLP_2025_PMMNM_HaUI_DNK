import { Outlet, NavLink } from "react-router-dom";
import { Map, Bell, FileText, User, ShieldAlert } from "lucide-react";

const CitizenLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      {" "}
      {/* pb-20 để nội dung không bị menu che */}
      {/* === HEADER MOBILE === */}
      <header className="fixed top-0 w-full z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <ShieldAlert className="text-primary w-6 h-6" />
          <h1 className="font-bold text-slate-800">Viet Resilience Hub</h1>
        </div>
        <div className="flex items-center gap-2 bg-red-50 text-red-600 px-2 py-1 rounded-lg text-xs font-bold border border-red-100 animate-pulse">
          <span className="w-2 h-2 rounded-full bg-red-500"></span>
          TRỰC TUYẾN
        </div>
      </header>
      {/* === NỘI DUNG CHÍNH (Thay đổi theo trang) === */}
      <main className="pt-14 h-full">
        <Outlet />
      </main>
      {/* === BOTTOM NAVIGATION (MENU ĐÁY) === */}
      <nav className="fixed bottom-0 w-full bg-white border-t border-slate-200 z-50 pb-safe">
        <div className="flex justify-around items-center h-16">
          <NavItem to="/citizen" icon={Map} label="Bản đồ" end />
          <NavItem to="/citizen/alerts" icon={Bell} label="Cảnh báo" />

          {/* Nút SOS Chính giữa - Nổi bật */}
          <div className="relative -top-6">
            <button className="w-16 h-16 bg-red-600 rounded-full shadow-lg shadow-red-500/40 flex items-center justify-center border-4 border-slate-50 text-white animate-bounce-slow hover:scale-105 transition-transform">
              <span className="font-black text-sm">SOS</span>
            </button>
          </div>

          <NavItem to="/citizen/report" icon={FileText} label="Báo cáo" />
          <NavItem to="/citizen/profile" icon={User} label="Cá nhân" />
        </div>
      </nav>
    </div>
  );
};

// Component con cho từng item menu
const NavItem = ({ to, icon: Icon, label, end }) => (
  <NavLink
    to={to}
    end={end}
    className={({ isActive }) => `
      flex flex-col items-center justify-center w-full h-full gap-1
      ${isActive ? "text-primary" : "text-slate-400 hover:text-slate-600"}
      transition-colors
    `}
  >
    <Icon size={24} strokeWidth={2} />
    <span className="text-[10px] font-medium">{label}</span>
  </NavLink>
);

export default CitizenLayout;
