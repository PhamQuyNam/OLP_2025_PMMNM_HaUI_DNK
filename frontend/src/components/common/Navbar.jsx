import { Link } from "react-router-dom";
import { ShieldAlert } from "lucide-react";

const Navbar = () => {
  return (
    <nav className="bg-white shadow-md fixed w-full z-50 top-0 left-0">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <ShieldAlert className="w-8 h-8 text-primary transition-transform group-hover:scale-110" />
          <div>
            <h1 className="text-xl font-bold text-slate-800 leading-none">
              Viet Resilience Hub
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              OLP 2025 - Haui-DNK
            </p>
          </div>
        </Link>

        {/* Menu Desktop */}
        <div className="hidden md:flex items-center gap-8 font-medium text-slate-600">
          <a href="#features" className="hover:text-primary transition-colors">
            Tính năng
          </a>
          <a href="#about" className="hover:text-primary transition-colors">
            Về dự án
          </a>
          <a href="#contact" className="hover:text-primary transition-colors">
            Liên hệ
          </a>
        </div>

        {/* Button */}
        <div className="flex gap-3">
          <Link
            to="/login"
            className="px-5 py-2 rounded-full bg-primary text-white font-semibold hover:bg-sky-600 transition-all shadow-lg hover:shadow-sky-200"
          >
            Đăng nhập
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
