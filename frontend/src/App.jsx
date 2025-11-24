import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/landing/LandingPage";

// Placeholder cho các trang chưa code (để không lỗi router)
const Login = () => (
  <h1 className="text-center mt-10 text-2xl">Trang Đăng Nhập (Coming Soon)</h1>
);
const CitizenApp = () => (
  <h1 className="text-center mt-10 text-2xl">
    Ứng dụng Người Dân (Coming Soon)
  </h1>
);
const ManagerDashboard = () => (
  <h1 className="text-center mt-10 text-2xl">
    Dashboard Quản Lý (Coming Soon)
  </h1>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/citizen" element={<CitizenApp />} />
        <Route path="/manager" element={<ManagerDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
