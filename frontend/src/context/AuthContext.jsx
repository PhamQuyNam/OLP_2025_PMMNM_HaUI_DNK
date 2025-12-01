import { createContext, useContext, useState, useEffect } from "react";
import authService from "../services/authService"; // Import service bạn đã có
import { useNavigate } from "react-router-dom"; // Để điều hướng khi login/logout

// 1. Tạo Context
const AuthContext = createContext();

// 2. Tạo Provider (Nhà cung cấp dữ liệu)
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Lưu thông tin User (Tên, Role, Avatar...)
  const [isLoading, setIsLoading] = useState(true); // Trạng thái tải lại trang (F5)

  // Hàm khởi tạo: Chạy 1 lần khi F5 để nạp lại user từ localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false); // Nạp xong
  }, []);

  // Hàm Login: Gọi API xong cập nhật State
  const login = async (formData) => {
    try {
      const data = await authService.login(formData);

      // Lưu vào LocalStorage (để F5 không mất)
      const userData = data.user; // Giả sử BE trả về object user
      const token = data.token || data.accessToken;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));

      // Cập nhật State (Để giao diện tự đổi ngay lập tức)
      setUser(userData);

      return userData; // Trả về để component Login biết đường redirect
    } catch (error) {
      throw error; // Ném lỗi để component Login hiển thị Toast
    }
  };

  // Hàm Logout
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    // Có thể điều hướng về trang chủ hoặc login tại đây nếu muốn
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

// 3. Hook tùy chỉnh để dùng nhanh ở các nơi khác
export const useAuth = () => {
  return useContext(AuthContext);
};
