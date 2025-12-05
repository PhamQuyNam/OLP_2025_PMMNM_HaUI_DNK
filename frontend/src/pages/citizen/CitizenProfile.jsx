/**
 * Copyright 2025 HaUI.DNK
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 */
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { User, Phone, Lock, Save, ArrowLeft } from "lucide-react";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import authService from "../../services/authService";

const CitizenProfile = () => {
  const { user, login } = useAuth(); // Lấy hàm login để cập nhật lại state sau khi sửa
  const [isLoading, setIsLoading] = useState(false);

  // State form
  const [formData, setFormData] = useState({
    username: user?.username || "",
    email: user?.email || "", // Email thường không cho sửa (readonly)
    phone: user?.phone || "",
    password: "", // Mật khẩu mới (để trống nếu không đổi)
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1. Gọi API Update
      // Lưu ý: Backend cần xử lý nếu password rỗng thì không update password
      const response = await authService.updateProfile(formData);

      // 2. Cập nhật lại AuthContext (Mẹo: Giả lập login lại bằng data mới)
      // Nếu API trả về user mới, ta cập nhật lại localStorage và Context
      const updatedUser = { ...user, ...formData };
      if (!formData.password) delete updatedUser.password; // Không lưu pass vào storage

      localStorage.setItem("user", JSON.stringify(updatedUser));
      // Reload lại trang hoặc gọi hàm cập nhật state trong context (nếu có)
      // Ở đây đơn giản nhất là thông báo thành công

      toast.success("Cập nhật thông tin thành công!");

      // Xóa field mật khẩu đi
      setFormData((prev) => ({ ...prev, password: "" }));
    } catch (error) {
      console.error(error);
      toast.error(
        "Lỗi cập nhật: " + (error.response?.data?.message || error.message)
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 pb-24">
      {/* Header Mobile */}
      <div className="flex items-center gap-3 mb-6 md:hidden">
        <Link to="/citizen" className="p-2 bg-white rounded-lg shadow-sm">
          <ArrowLeft size={20} className="text-slate-600" />
        </Link>
        <h1 className="text-xl font-bold text-slate-800">Hồ sơ cá nhân</h1>
      </div>

      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Banner trang trí */}
        <div className="h-32 bg-gradient-to-r from-primary to-sky-600 relative">
          <div className="absolute -bottom-10 left-8">
            <div className="w-24 h-24 rounded-full bg-white p-1 shadow-lg">
              <div className="w-full h-full rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
                <User size={40} />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-12 px-8 pb-8">
          <h2 className="text-2xl font-bold text-slate-800">
            {user?.username}
          </h2>
          <p className="text-slate-500 font-medium mb-6">{user?.email}</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Họ tên (Readonly hoặc Edit tùy backend, ở đây giả sử cho sửa) */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">
                Họ và tên
              </label>
              <div className="relative">
                <User
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
              </div>
            </div>

            {/* Số điện thoại */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">
                Số điện thoại
              </label>
              <div className="relative">
                <Phone
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Cập nhật SĐT để nhận cảnh báo SMS"
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                />
              </div>
            </div>

            {/* Mật khẩu mới */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">
                Đổi mật khẩu{" "}
                <span className="text-slate-400 font-normal">
                  (Bỏ trống nếu không đổi)
                </span>
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                />
              </div>
            </div>

            {/* Button Save */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary hover:bg-sky-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-primary/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Save size={18} /> Lưu thay đổi
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CitizenProfile;
