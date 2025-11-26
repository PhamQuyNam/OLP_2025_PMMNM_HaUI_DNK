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
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/landing/LandingPage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";

const CitizenApp = () => (
  <h1 className="text-center mt-10 text-2xl text-slate-600">
    Ứng dụng Người Dân (Đang phát triển...)
  </h1>
);

const ManagerDashboard = () => (
  <h1 className="text-center mt-10 text-2xl text-slate-600">
    Dashboard Quản Lý (Đang phát triển...)
  </h1>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 1. Trang chủ */}
        <Route path="/" element={<LandingPage />} />

        {/* 2. Nhóm trang Xác thực (Auth) - Đã sửa lại dùng component thật */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* 3. Nhóm trang Chức năng chính (Sau này sẽ code) */}
        <Route path="/citizen" element={<CitizenApp />} />
        <Route path="/manager" element={<ManagerDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
