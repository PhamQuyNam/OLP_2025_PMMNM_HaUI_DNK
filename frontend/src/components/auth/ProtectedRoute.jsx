// src/components/auth/ProtectedRoute.jsx
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  // 1. Kiểm tra token trong LocalStorage
  // (Lưu ý: Key bạn lưu bên LoginPage là "token")
  const isAuthenticated = localStorage.getItem("token");

  // 2. Logic điều hướng
  // Nếu KHÔNG có token -> Đá về trang Login, replace để không back lại được
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 3. Nếu có token -> Cho phép hiển thị nội dung bên trong (Outlet)
  return <Outlet />;
};

export default ProtectedRoute;
