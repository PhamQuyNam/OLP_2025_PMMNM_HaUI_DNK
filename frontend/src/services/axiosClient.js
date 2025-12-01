import axios from "axios";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// --- INTERCEPTORS (Bộ đón chặn) ---

// 1. Gửi đi: Tự động đính kèm Token nếu đã đăng nhập
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 2. Nhận về: Chỉ lấy data, xử lý lỗi gọn gàng
axiosClient.interceptors.response.use(
  (response) => {
    return response.data; // Trả về cục data sạch
  },
  (error) => {
    // Log lỗi ra console để dev dễ debug
    console.error("API Error:", error.response);
    // Trả về message lỗi từ Backend (nếu có) hoặc lỗi mặc định
    return Promise.reject(error.response?.data || error.message);
  }
);

export default axiosClient;
