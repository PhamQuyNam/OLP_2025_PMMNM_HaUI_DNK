/**
 * Copyright 2025 HaUI.DNK
 *
 * Licensed under the Apache License, Version 2.0
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND.
 */

import { Link } from "react-router-dom";
import { ShieldCheck, ArrowLeft } from "lucide-react";

const AuthLayout = ({ children, title, subtitle }) => {
  return (
    // Tổng thể nền trắng
    <div className="min-h-screen flex bg-white font-sans">
      {/* === CỘT TRÁI: ARTWORK & BRANDING (ĐÃ NÂNG CẤP ANIMATION) === */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 relative overflow-hidden items-center justify-center">
        {/* 1. GRID NỀN (ĐÃ THÊM CHUYỂN ĐỘNG) */}
        {/* Thêm class 'animate-grid-flow' vào đây */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff1a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff1a_1px,transparent_1px)] bg-[size:40px_40px] animate-grid-flow"></div>

        {/* Hiệu ứng Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#0f172a_90%)]"></div>

        {/* 2. LIGHT BLOBS */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>

        {/* 3. NỘI DUNG CHÍNH */}
        <div className="relative z-10 text-center px-12 max-w-2xl">
          <div className="mb-10 flex justify-center">
            <div className="relative">
              {/* Hiệu ứng tỏa sáng TỰ ĐỘNG (Breathe Animation) */}
              {/* Đã thay đổi: animate-breathe thay vì group-hover */}
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-indigo-500 rounded-3xl blur opacity-40 animate-breathe"></div>

              {/* Icon chính */}
              <div className="relative w-24 h-24 bg-slate-900/50 backdrop-blur-xl rounded-3xl flex items-center justify-center border border-white/10 shadow-2xl">
                <ShieldCheck
                  size={56}
                  className="text-primary drop-shadow-[0_0_10px_rgba(14,165,233,0.5)]"
                />
              </div>
            </div>
          </div>

          {/* ... (Các phần text bên dưới giữ nguyên) */}
          <h2 className="text-5xl font-bold text-white mb-6 tracking-tight leading-tight">
            Viet{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-sky-300">
              Resilience
            </span>{" "}
            Hub
          </h2>

          <p className="text-slate-400 text-lg leading-relaxed font-medium">
            Hệ thống cảnh báo thiên tai thông minh &<br /> Nền tảng dữ liệu mở
            quốc gia.
          </p>

          <div className="mt-12 inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-slate-800/50 border border-white/10 backdrop-blur-md shadow-lg">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold text-slate-300 tracking-widest uppercase">
              Sản phẩm dự thi OLP 2025
            </span>
          </div>
        </div>

        {/* Đường cong (Giữ nguyên) */}
        <div className="absolute top-0 right-0 bottom-0 w-16 h-full z-20 pointer-events-none overflow-hidden">
          <svg
            className="h-full w-full text-white fill-current"
            preserveAspectRatio="none"
            viewBox="0 0 100 100"
          >
            <path d="M 100 0 L 50 0 C 10 30, 10 70, 50 100 L 100 100 Z" />
          </svg>
        </div>
      </div>

      {/* === CỘT PHẢI: FORM AREA === */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 lg:px-24 relative z-10">
        {/* Nút quay lại */}
        <Link
          to="/"
          className="absolute top-8 left-8 flex items-center gap-2 text-slate-500 hover:text-primary transition-colors group text-sm font-bold uppercase tracking-wide"
        >
          <ArrowLeft
            size={18}
            className="group-hover:-translate-x-1 transition-transform"
          />
          Trang chủ
        </Link>

        <div className="w-full max-w-[400px] mx-auto">
          <div className="mb-10">
            <h1 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">
              {title}
            </h1>
            <p className="text-slate-500 font-medium">{subtitle}</p>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
