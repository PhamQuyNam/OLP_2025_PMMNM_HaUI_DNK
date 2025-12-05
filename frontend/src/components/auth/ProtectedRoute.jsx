/**
 * Copyright 2025 HaUI.DNK
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 */
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";

// Nhận thêm prop: allowedRoles (Mảng các quyền được phép vào)
const ProtectedRoute = ({ allowedRoles }) => {
  const { user, isLoading } = useAuth();

  // 1. Đang tải thông tin user thì chưa làm gì cả (tránh đá oan)
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // 2. Chưa đăng nhập -> Đá về Login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 3. Đã đăng nhập nhưng SAI QUYỀN (Ví dụ: Dân đòi vào trang Quản lý)
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Nếu cố tình vào, hiển thị thông báo lỗi
    // Lưu ý: Dùng toast ở đây có thể bị render 2 lần (do React.StrictMode), nhưng không sao.
    return <Navigate to="/unauthorized" replace />;
    // Hoặc đá thẳng về trang chủ của họ:
    // return <Navigate to={user.role === "MANAGER" ? "/manager" : "/citizen"} replace />;
  }

  // 4. Đúng quyền -> Mời vào
  return <Outlet />;
};

export default ProtectedRoute;
