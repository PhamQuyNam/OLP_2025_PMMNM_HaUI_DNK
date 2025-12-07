/**
 * Copyright 2025 HaUI.DNK
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 */
import { Outlet, NavLink, Link, useNavigate } from "react-router-dom"; // Thêm useNavigate
import {
  LayoutDashboard,
  Map as MapIcon,
  BellRing,
  Database,
  FileText,
  Settings,
  LogOut,
  ShieldAlert,
  Home, // Thêm icon Home
} from "lucide-react";
import { useAuth } from "../context/AuthContext"; // 1. Import AuthContext

const ManagerLayout = () => {
  const { logout } = useAuth(); // 2. Lấy hàm logout
  const navigate = useNavigate();

  // Hàm xử lý đăng xuất
  const handleLogout = () => {
    logout();
    navigate("/"); // Về Landing Page sau khi thoát
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex font-sans">
      {/* === SIDEBAR === */}
      <aside className="w-64 bg-slate-950 border-r border-slate-800 flex-shrink-0 flex flex-col fixed h-full z-50">
        {/* Logo Area */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-800">
          <div className="bg-primary p-1.5 rounded-lg shadow-lg shadow-primary/20">
            <ShieldAlert className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight text-white">
              VRH Admin
            </h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
              Control Center
            </p>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          <p className="px-3 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Giám sát
          </p>

          <ManagerNavItem
            to="/manager"
            icon={LayoutDashboard}
            label="Tổng quan"
            end
          />
          <ManagerNavItem
            to="/manager/reports" // Đổi đường dẫn
            icon={FileText} // Đổi icon cho hợp
            label="Danh sách Phản ánh" // Đổi tên
          />
          <ManagerNavItem
            to="/manager/sos"
            icon={BellRing}
            label="Quản lý Cứu hộ"
          />

          <p className="px-3 text-xs font-bold text-slate-500 uppercase tracking-wider mt-6 mb-2">
            Quản trị
          </p>
          <ManagerNavItem
            to="/manager/data"
            icon={Database}
            label="Dữ liệu nguồn"
          />
          <ManagerNavItem
            to="/manager/settings"
            icon={Settings}
            label="Cấu hình hệ thống"
          />
        </nav>

        {/* User Profile / Logout / Home */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          {/* Nút Về trang chủ (Mới thêm) */}
          <Link
            to="/"
            className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white py-2 rounded-lg text-sm font-medium transition-colors border border-slate-800"
          >
            <Home size={16} /> Về Trang chủ
          </Link>

          {/* Nút Đăng xuất (Đã gắn logic) */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-900/20 hover:bg-red-900/40 text-red-400 py-2 rounded-lg text-sm font-medium transition-colors border border-red-900/30"
          >
            <LogOut size={16} /> Đăng xuất
          </button>
        </div>
      </aside>

      {/* === MAIN CONTENT === */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        {/* Header */}
        {/* 👇 GIẢI QUYẾT VẤN ĐỀ 1: 
            Tăng z-index từ z-40 lên z-[500] để Header luôn nằm đè lên Bản đồ (Map có z-400) 
        */}
        <header className="h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-[500] flex items-center justify-between px-8">
          <h2 className="text-lg font-semibold text-slate-200">
            Trung tâm Điều hành Thông minh
          </h2>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-bold text-emerald-400">
                Hệ thống ổn định
              </span>
            </div>
            <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full relative">
              <BellRing size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-slate-900"></span>
            </button>
          </div>
        </header>

        {/* Nội dung thay đổi */}
        <main className="p-8 flex-1 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

// Component Link Sidebar
const ManagerNavItem = ({ to, icon: Icon, label, end }) => (
  <NavLink
    to={to}
    end={end}
    className={({ isActive }) => `
      flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
      ${
        isActive
          ? "bg-primary text-white shadow-lg shadow-primary/20"
          : "text-slate-400 hover:text-slate-100 hover:bg-slate-800"
      }
    `}
  >
    <Icon size={18} />
    {label}
  </NavLink>
);

export default ManagerLayout;
