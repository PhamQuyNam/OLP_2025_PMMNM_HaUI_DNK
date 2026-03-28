import { Link } from "react-router-dom";
import { ShieldAlert, Menu, LogOut, UserCircle, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext"; // Import hook Auth

const Navbar = () => {
  // State để xử lý hiệu ứng khi cuộn trang
  const [isScrolled, setIsScrolled] = useState(false);
  // State để đóng/mở menu trên điện thoại
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Lấy thông tin user và hàm logout từ Context
  const { user, logout } = useAuth();

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
              Ứng dụng Cảnh báo Thiên tai
            </span>
          </div>
        </Link>

        {/* === MENU DESKTOP === */}
        <div className="hidden md:flex items-center gap-10 bg-white/50 px-8 py-2 rounded-full border border-slate-100 backdrop-blur-sm">
          {["Tính năng", "Về dự án", "Liên hệ"].map((item) => {
            const path = item === "Tính năng" ? "/features" : item === "Về dự án" ? "/about" : "/contact";
            return (
              <Link
                key={item}
                to={path}
                className="relative text-slate-600 font-medium hover:text-primary transition-colors text-sm group/link"
              >
                {item}
                <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-primary transform scale-x-0 group-hover/link:scale-x-100 transition-transform duration-300" />
              </Link>
            );
          })}
        </div>

        {/* === BUTTONS (KHU VỰC THAY ĐỔI LOGIC) === */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            // --- TRƯỜNG HỢP 1: ĐÃ ĐĂNG NHẬP ---
            <div className="flex items-center gap-4 animate-fade-in-up">
              {/* Thông tin User */}
              <div className="flex items-center gap-2 bg-white/60 px-3 py-1.5 rounded-full border border-slate-200/50 backdrop-blur-sm">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary/20 to-sky-100 flex items-center justify-center text-primary border border-white shadow-sm">
                  <UserCircle size={20} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 font-bold uppercase leading-none">
                    Xin chào
                  </span>
                  <span className="text-sm font-bold text-slate-800 leading-none">
                    {user.username || "Cư dân"}
                  </span>
                </div>
              </div>

              {/* Nút Đăng xuất */}
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold text-slate-600 hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all border border-slate-200 shadow-sm bg-white"
                title="Đăng xuất"
              >
                <LogOut size={16} />
                Thoát
              </button>
            </div>
          ) : (
            // --- TRƯỜNG HỢP 2: CHƯA ĐĂNG NHẬP (Giao diện cũ) ---
            <>
              <Link
                to="/login"
                className="px-5 py-2.5 rounded-full text-sm font-semibold text-slate-600 hover:text-primary hover:bg-sky-50 transition-all border border-transparent hover:border-sky-100"
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                className="px-6 py-2.5 rounded-full text-sm font-bold text-white bg-primary shadow-lg shadow-sky-200 hover:shadow-sky-300 hover:bg-primary-hover hover:-translate-y-0.5 transition-all"
              >
                Đăng ký ngay
              </Link>
            </>
          )}
        </div>

        {/* === MOBILE MENU BUTTON === */}
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* === MOBILE DROPDOWN MENU === */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white/95 backdrop-blur-xl shadow-xl border-t border-slate-100 py-4 px-6 flex flex-col gap-2 z-40 transform transition-all">
          <div className="flex flex-col mb-4">
            {["Tính năng", "Về dự án", "Liên hệ"].map((item) => {
              const path = item === "Tính năng" ? "/features" : item === "Về dự án" ? "/about" : "/contact";
              return (
                <Link
                  key={item}
                  to={path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-slate-600 font-bold hover:text-primary hover:bg-slate-50 transition-colors py-3 px-4 rounded-xl"
                >
                  {item}
                </Link>
              );
            })}
          </div>
          
          <div className="border-t border-slate-100 pt-4 flex flex-col gap-3">
            {user ? (
              <>
                <div className="flex items-center gap-3 bg-slate-50 px-4 py-3 rounded-2xl border border-slate-100">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary/20 to-sky-100 flex items-center justify-center text-primary">
                    <UserCircle size={24} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Xin chào</span>
                    <span className="text-base font-black text-slate-800">{user.username || "Cư dân"}</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    logout();
                  }}
                  className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl text-sm font-bold text-red-500 bg-red-50 hover:bg-red-100 transition-colors"
                >
                  <LogOut size={18} />
                  Đăng xuất tài khoản
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full py-3.5 text-center rounded-2xl text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full py-3.5 text-center rounded-2xl text-sm font-bold text-white bg-primary hover:bg-primary-hover shadow-lg shadow-sky-200 transition-colors"
                >
                  Đăng ký ngay
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
