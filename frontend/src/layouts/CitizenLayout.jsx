/**
 * Copyright 2025 HaUI.DNK
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 */
import { useState, useRef, useEffect } from "react"; // Thêm hook
import { Outlet, NavLink, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // Import AuthContext
import {
  Map,
  Bell,
  FileText,
  BookOpen,
  ShieldAlert,
  UserCircle,
  LogOut, // Icon Đăng xuất
  Settings, // Icon Cài đặt
} from "lucide-react";

const CitizenLayout = () => {
  const { user, logout } = useAuth(); // Lấy thông tin user và hàm logout
  const [isMenuOpen, setIsMenuOpen] = useState(false); // State đóng mở menu
  const menuRef = useRef(null); // Ref để phát hiện click ra ngoài

  // Logic: Click ra ngoài thì đóng menu
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

        {/* === MENU DESKTOP === */}
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
          />

          {/* Nút SOS Desktop */}
          <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full font-bold shadow-lg shadow-red-200 flex items-center gap-2 transition-transform hover:scale-105 ml-4">
            <ShieldAlert size={18} /> SOS Khẩn cấp
          </button>

          {/* === AVATAR DROPDOWN (DESKTOP) - PHẦN SỬA ĐỔI === */}
          <div className="relative ml-4" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1 rounded-full hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200 flex items-center gap-2"
            >
              {/* Hiển thị tên user bên cạnh avatar */}
              <div className="text-right hidden lg:block">
                <p className="text-xs font-bold text-slate-700">
                  {user?.username || "Người dân"}
                </p>
                <p className="text-[10px] text-slate-400">Tài khoản</p>
              </div>
              <UserCircle size={32} className="text-slate-600" />
            </button>

            {/* Menu Dropdown */}
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden animate-fade-in-up origin-top-right">
                {/* Header của Menu */}
                <div className="p-3 border-b border-slate-50 bg-slate-50/50">
                  <p className="text-sm font-bold text-slate-800 truncate">
                    {user?.username}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {user?.email}
                  </p>
                </div>

                {/* Các lựa chọn */}
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
                      logout(); // Gọi hàm đăng xuất
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

        {/* === MOBILE HEADER RIGHT (Profile & Status) === */}
        {/* Mobile tạm thời vẫn giữ link trực tiếp để dễ thao tác trên màn hình nhỏ */}
        <div className="md:hidden flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-2 py-1 rounded-lg text-[10px] font-bold border border-emerald-100 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            ONLINE
          </div>
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

          {/* Nút SOS */}
          <div className="relative -top-5">
            <button className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-full shadow-xl shadow-red-500/40 flex items-center justify-center border-4 border-slate-50 text-white animate-bounce-slow active:scale-95 transition-transform">
              <span className="font-black text-xs tracking-tighter">SOS</span>
            </button>
          </div>

          <MobileNavItem to="/citizen/report" icon={FileText} label="Báo cáo" />
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
