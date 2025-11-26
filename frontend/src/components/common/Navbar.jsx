// SPDX-License-Identifier: Apache-2.0
/**
 * Copyright 2025 Haui.DNK
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 */
import { Link } from "react-router-dom";
import { ShieldAlert, Menu } from "lucide-react";
import { useState, useEffect } from "react";

const Navbar = () => {
  // State để xử lý hiệu ứng khi cuộn trang
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed w-full z-50 top-0 left-0 transition-all duration-300 ${
        isScrolled ? "glass-nav shadow-md py-2" : "bg-transparent py-4"
      }`}
    >
      <div className="container mx-auto px-6 flex justify-between items-center">
        {/* === LOGO === */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="bg-primary/10 p-2 rounded-lg group-hover:bg-primary/20 transition-colors">
            <ShieldAlert className="w-8 h-8 text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-extrabold tracking-tight text-slate-800">
              Viet<span className="text-primary">Resilience</span>Hub
            </span>
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              Hệ thống Cảnh báo Thiên tai
            </span>
          </div>
        </Link>

        {/* === MENU DESKTOP (Căn giữa đẹp mắt) === */}
        <div className="hidden md:flex items-center gap-10 bg-white/50 px-8 py-2 rounded-full border border-slate-100 backdrop-blur-sm">
          {["Tính năng", "Về dự án", "Liên hệ"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(/\s/g, "-")}`}
              className="relative text-slate-600 font-medium hover:text-primary transition-colors text-sm group/link"
            >
              {item}
              {/* Hiệu ứng gạch chân chạy ra từ giữa */}
              <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-primary transform scale-x-0 group-hover/link:scale-x-100 transition-transform duration-300" />
            </a>
          ))}
        </div>

        {/* === BUTTONS (Đăng nhập & Đăng ký) === */}
        <div className="hidden md:flex items-center gap-3">
          {/* Nút Đăng nhập (Outline - Nhẹ nhàng) */}
          <Link
            to="/login"
            className="px-5 py-2.5 rounded-full text-sm font-semibold text-slate-600 hover:text-primary hover:bg-sky-50 transition-all border border-transparent hover:border-sky-100"
          >
            Đăng nhập
          </Link>

          {/* Nút Đăng ký (Solid - Nổi bật) */}
          <Link
            to="/register"
            className="px-6 py-2.5 rounded-full text-sm font-bold text-white bg-primary shadow-lg shadow-sky-200 hover:shadow-sky-300 hover:bg-primary-hover hover:-translate-y-0.5 transition-all"
          >
            Đăng ký ngay
          </Link>
        </div>

        {/* === MOBILE MENU BUTTON === */}
        <button className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
          <Menu size={24} />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
