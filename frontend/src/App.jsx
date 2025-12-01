import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/landing/LandingPage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";

// Citizen Imports
import CitizenLayout from "./layouts/CitizenLayout";
import CitizenHomePage from "./pages/citizen/CitizenHomePage";
import CitizenGuidePage from "./pages/citizen/CitizenGuidePage";

// Manager Imports
import ManagerLayout from "./layouts/ManagerLayout";
import ManagerDashboardPage from "./pages/manager/ManagerDashboardPage"; // <-- Import file mới tạo
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// Placeholder (Giữ lại các trang chưa làm)
const CitizenAlerts = () => (
  <h1 className="text-center mt-20">Danh sách Cảnh báo (Coming Soon)</h1>
);
const CitizenReport = () => (
  <h1 className="text-center mt-20">Gửi Báo cáo (Coming Soon)</h1>
);
const CitizenProfile = () => (
  <h1 className="text-center mt-20">Hồ sơ Cá nhân (Coming Soon)</h1>
);

function App() {
  return (
    <BrowserRouter>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Citizen */}
        <Route path="/citizen" element={<CitizenLayout />}>
          <Route index element={<CitizenHomePage />} />
          <Route path="alerts" element={<CitizenAlerts />} />
          <Route path="report" element={<CitizenReport />} />
          <Route path="profile" element={<CitizenProfile />} />
          <Route path="guide" element={<CitizenGuidePage />} />
        </Route>

        {/* Manager */}
        <Route path="/manager" element={<ManagerLayout />}>
          {/* 👇 SỬ DỤNG TRANG THẬT Ở ĐÂY */}
          <Route index element={<ManagerDashboardPage />} />

          <Route
            path="map"
            element={
              <h1 className="text-white p-10">
                Bản đồ rủi ro (Đang phát triển)
              </h1>
            }
          />
          <Route
            path="incidents"
            element={
              <h1 className="text-white p-10">
                Quản lý sự cố (Đang phát triển)
              </h1>
            }
          />
          <Route
            path="data"
            element={
              <h1 className="text-white p-10">
                Quản lý dữ liệu (Đang phát triển)
              </h1>
            }
          />
          <Route
            path="settings"
            element={
              <h1 className="text-white p-10">Cấu hình (Đang phát triển)</h1>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
