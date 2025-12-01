import { createContext, useContext, useState, useEffect } from "react";
import authService from "../services/authService";

// 1. Khởi tạo Context
const AuthContext = createContext();

// 2. Tạo Provider
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load lại user từ localStorage khi F5 trang
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Lỗi parse user từ storage", error);
        // Nếu lỗi (ví dụ storage bị sửa bậy), xóa sạch để an toàn
        logout();
      }
    }
    setIsLoading(false);
  }, []);

  // Hàm Login: Gọi API -> Lưu Storage -> Cập nhật State
  const login = async (formData) => {
    try {
      const response = await authService.login(formData);

      // Chú ý: Cấu trúc response phụ thuộc vào BE trả về.
      // Dựa vào code cũ của bạn: response.user và response.token (hoặc accessToken)
      const userData = response.user;
      const token = response.token || response.accessToken;

      if (userData && token) {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData); // Cập nhật ngay lập tức để giao diện đổi
      }

      return response; // Trả về để component biết đường xử lý tiếp
    } catch (error) {
      throw error; // Ném lỗi ra để component hiển thị Toast
    }
  };

  // Hàm Logout: Xóa sạch -> Về null
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    // Tùy chọn: Chuyển hướng về trang login sau khi logout
    // window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

// 3. Hook custom để dùng nhanh ở các component khác
export const useAuth = () => {
  return useContext(AuthContext);
};
