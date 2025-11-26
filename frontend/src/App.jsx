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

// Import mới
import CitizenLayout from "./layouts/CitizenLayout";
import CitizenHomePage from "./pages/citizen/CitizenHomePage";

// Placeholder
const ManagerDashboard = () => (
  <h1 className="text-center mt-10">Dashboard (Đang phát triển)</h1>
);
const CitizenAlerts = () => (
  <h1 className="text-center mt-20">Danh sách Cảnh báo</h1>
);
const CitizenReport = () => <h1 className="text-center mt-20">Gửi Báo cáo</h1>;
const CitizenProfile = () => (
  <h1 className="text-center mt-20">Hồ sơ Cá nhân</h1>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Citizen Routes (Có Layout riêng) */}
        <Route path="/citizen" element={<CitizenLayout />}>
          <Route index element={<CitizenHomePage />} />{" "}
          {/* Trang chủ mặc định */}
          <Route path="alerts" element={<CitizenAlerts />} />
          <Route path="report" element={<CitizenReport />} />
          <Route path="profile" element={<CitizenProfile />} />
        </Route>

        {/* Manager Routes */}
        <Route path="/manager" element={<ManagerDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
