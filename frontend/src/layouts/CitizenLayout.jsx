import { useState, useRef, useEffect } from "react";
import { Outlet, NavLink, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext"; // Import Socket
import SOSModal from "../components/citizen/SOSModal";
import {
  Map,
  Bell,
  FileText,
  BookOpen,
  ShieldAlert,
  UserCircle,
  LogOut,
  Settings,
} from "lucide-react";

const CitizenLayout = () => {
  const { user, logout } = useAuth();
  const socket = useSocket(); // Dùng socket
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const [isSosOpen, setIsSosOpen] = useState(false);

  // State quản lý Notification Badge
  const [hasNewAlert, setHasNewAlert] = useState(false);

  // Lắng nghe Socket để bật chấm đỏ
  useEffect(() => {
    if (!socket) return;

    // 1. Khi có Cảnh báo mới
    socket.on("alert:broadcast", () => {
      setHasNewAlert(true);
    });

    return () => {
      socket.off("alert:broadcast");
    };
  }, [socket]);

  // Click ra ngoài đóng menu user
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20 md:pb-0">
      <SOSModal isOpen={isSosOpen} onClose={() => setIsSosOpen(false)} />

      {/* HEADER */}
      <header className="fixed top-0 w-full z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 md:px-8 py-3 flex items-center justify-between shadow-sm transition-all">
        <div className="flex items-center gap-4 md:gap-8">
          <Link
            to="/"
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-bold text-slate-600 border border-slate-200 rounded-lg hover:text-red-600 hover:bg-red-50 transition-all group bg-white shadow-sm"
          >
            <span>Trang chủ</span>
            <LogOut
              size={16}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
        </div>

        {/* MENU DESKTOP */}
        <div className="hidden md:flex items-center gap-6">
          <DesktopNavLink to="/citizen" icon={Map} label="Bản đồ" end />

          {/* Menu Cảnh báo (Có Badge) */}
          <DesktopNavLink
            to="/citizen/alerts"
            icon={Bell}
            label="Cảnh báo"
            hasBadge={hasNewAlert}
            onClick={() => setHasNewAlert(false)} // Click vào thì tắt chấm đỏ
          />

          <DesktopNavLink
            to="/citizen/report"
            icon={FileText}
            label="Phản ánh"
            hasBadge={true}
          />

          <DesktopNavLink
            to="/citizen/guide"
            icon={BookOpen}
            label="Cẩm nang"
          />

          <button
            onClick={() => setIsSosOpen(true)}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full font-bold shadow-lg shadow-red-200 flex items-center gap-2 transition-transform hover:scale-105 ml-4 animate-pulse"
          >
            <ShieldAlert size={18} /> SOS Khẩn cấp
          </button>

          {/* USER MENU */}
          <div className="relative ml-4" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1 rounded-full hover:bg-slate-100 flex items-center gap-2"
            >
              <div className="text-right hidden lg:block">
                <p className="text-xs font-bold text-slate-700">
                  {user?.username || "Người dân"}
                </p>
                <p className="text-[10px] text-slate-400">Tài khoản</p>
              </div>
              <UserCircle size={32} className="text-slate-600" />
            </button>
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden animate-fade-in-up origin-top-right">
                <div className="p-3 border-b border-slate-50 bg-slate-50/50">
                  <p className="text-sm font-bold text-slate-800 truncate">
                    {user?.username}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {user?.email}
                  </p>
                </div>
                <div className="p-1">
                  <Link
                    to="/citizen/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-primary rounded-lg transition-colors"
                  >
                    <Settings size={16} /> Thông tin cá nhân
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left"
                  >
                    <LogOut size={16} /> Đăng xuất
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* MOBILE HEADER RIGHT */}
        <div className="md:hidden flex items-center gap-3">
          <Link
            to="/citizen/profile"
            className="text-slate-500 hover:text-primary"
          >
            <UserCircle size={28} />
          </Link>
        </div>
      </header>

      <main className="pt-16 h-full">
        <Outlet />
      </main>

      {/* BOTTOM NAV (MOBILE) */}
      <nav className="md:hidden fixed bottom-0 w-full bg-white border-t border-slate-200 z-50 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="flex justify-around items-center h-16 px-2">
          <MobileNavItem to="/citizen" icon={Map} label="Bản đồ" end />

          <MobileNavItem
            to="/citizen/alerts"
            icon={Bell}
            label="Cảnh báo"
            hasBadge={hasNewAlert}
            onClick={() => setHasNewAlert(false)}
          />

          <div className="relative -top-5">
            <button
              onClick={() => setIsSosOpen(true)}
              className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-full shadow-xl shadow-red-500/40 flex items-center justify-center border-4 border-slate-50 text-white animate-bounce-slow active:scale-95 transition-transform"
            >
              <span className="font-black text-xs tracking-tighter">SOS</span>
            </button>
          </div>

          <MobileNavItem
            to="/citizen/report"
            icon={FileText}
            label="Phản ánh"
            hasBadge={true}
          />

          <MobileNavItem to="/citizen/guide" icon={BookOpen} label="Cẩm nang" />
        </div>
      </nav>
    </div>
  );
};

// 👇 Cập nhật DesktopNavLink có chấm đỏ
const DesktopNavLink = ({ to, icon: Icon, label, end, hasBadge, onClick }) => (
  <NavLink
    to={to}
    end={end}
    onClick={onClick}
    className={({ isActive }) =>
      `relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
        isActive
          ? "bg-primary/10 text-primary"
          : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
      }`
    }
  >
    <Icon size={18} /> {label}
    {/* Chấm đỏ */}
    {hasBadge && (
      <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full animate-pulse-fast"></span>
    )}
  </NavLink>
);

// 👇 Cập nhật MobileNavItem có chấm đỏ
const MobileNavItem = ({ to, icon: Icon, label, end, hasBadge, onClick }) => (
  <NavLink
    to={to}
    end={end}
    onClick={onClick}
    className={({ isActive }) =>
      `relative flex flex-col items-center justify-center w-full h-full gap-1 ${
        isActive ? "text-primary" : "text-slate-400 hover:text-slate-600"
      } transition-colors`
    }
  >
    {({ isActive }) => (
      <>
        <div className="relative">
          <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
          {hasBadge && (
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full animate-pulse-fast"></span>
          )}
        </div>
        <span className="text-[10px] font-medium">{label}</span>
      </>
    )}
  </NavLink>
);

export default CitizenLayout;
