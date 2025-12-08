/**
 * Copyright 2025 HaUI.DNK
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
import CitizenReportPage from "./pages/citizen/CitizenReportPage";
// Citizen Imports
import CitizenLayout from "./layouts/CitizenLayout";
import CitizenHomePage from "./pages/citizen/CitizenHomePage";
import CitizenGuidePage from "./pages/citizen/CitizenGuidePage";
import CitizenProfile from "./pages/citizen/CitizenProfile";
import CitizenAlertsPage from "./pages/citizen/CitizenAlertsPage";
// Manager Imports
import ManagerLayout from "./layouts/ManagerLayout";
import ManagerDashboardPage from "./pages/manager/ManagerDashboardPage";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import UnauthorizedPage from "./pages/auth/UnauthorizedPage";
import ManagerReportsPage from "./pages/manager/ManagerReportsPage";
import ManagerSosPage from "./pages/manager/ManagerSosPage";
import ManagerAlertsPage from "./pages/manager/ManagerAlertsPage";
// Placeholder
const CitizenAlerts = () => (
  <h1 className="text-center mt-20">Danh sách Cảnh báo (Coming Soon)</h1>
);

function App() {
  return (
    <BrowserRouter>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        {/* === PUBLIC ROUTES === */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* === PROTECTED ROUTES (Đã đăng nhập mới được vào) === */}
        <Route
          element={
            <ProtectedRoute allowedRoles={["CITIZEN", "MANAGER", "ADMIN"]} />
          }
        >
          {/* 1. Khu vực Người Dân */}
          <Route path="/citizen" element={<CitizenLayout />}>
            <Route index element={<CitizenHomePage />} />
            <Route path="alerts" element={<CitizenAlertsPage />} />
            <Route path="report" element={<CitizenReportPage />} />
            <Route path="profile" element={<CitizenProfile />} />
            <Route path="guide" element={<CitizenGuidePage />} />
          </Route>
        </Route>
        {/* 2. Khu vực Quản lý (Tạm thời bọc vào đây để chặn người lạ) */}
        <Route element={<ProtectedRoute allowedRoles={["MANAGER", "ADMIN"]} />}>
          <Route path="/manager" element={<ManagerLayout />}>
            <Route index element={<ManagerDashboardPage />} />
            <Route path="reports" element={<ManagerReportsPage />} />
            <Route path="sos" element={<ManagerSosPage />} />
            <Route path="alerts" element={<ManagerAlertsPage />} />
            <Route
              path="data"
              element={
                <h1 className="text-white p-10">Quản lý dữ liệu (Dev)</h1>
              }
            />
            <Route
              path="settings"
              element={<h1 className="text-white p-10">Cấu hình (Dev)</h1>}
            />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
