import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/landing/LandingPage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";

// Citizen Imports
import CitizenLayout from "./layouts/CitizenLayout";
import CitizenHomePage from "./pages/citizen/CitizenHomePage";
import CitizenGuidePage from "./pages/citizen/CitizenGuidePage";
import CitizenProfile from "./pages/citizen/CitizenProfile";
// Manager Imports
import ManagerLayout from "./layouts/ManagerLayout";
import ManagerDashboardPage from "./pages/manager/ManagerDashboardPage";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import UnauthorizedPage from "./pages/auth/UnauthorizedPage";

// Placeholder
const CitizenAlerts = () => (
  <h1 className="text-center mt-20">Danh sách Cảnh báo (Coming Soon)</h1>
);
const CitizenReport = () => (
  <h1 className="text-center mt-20">Gửi Báo cáo (Coming Soon)</h1>
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
            <Route path="alerts" element={<CitizenAlerts />} />
            <Route path="report" element={<CitizenReport />} />
            <Route path="profile" element={<CitizenProfile />} />
            <Route path="guide" element={<CitizenGuidePage />} />
          </Route>
        </Route>
        {/* 2. Khu vực Quản lý (Tạm thời bọc vào đây để chặn người lạ) */}
        <Route element={<ProtectedRoute allowedRoles={["MANAGER", "ADMIN"]} />}>
          <Route path="/manager" element={<ManagerLayout />}>
            <Route index element={<ManagerDashboardPage />} />
            <Route
              path="map"
              element={<h1 className="text-white p-10">Bản đồ rủi ro (Dev)</h1>}
            />
            <Route
              path="incidents"
              element={<h1 className="text-white p-10">Quản lý sự cố (Dev)</h1>}
            />
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
