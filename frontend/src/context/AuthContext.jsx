/**
 * Copyright 2025 HaUI.DNK
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 */
import { createContext, useContext, useState, useEffect } from "react";
import authService from "../services/authService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Thêm State lưu vị trí (Mặc định là null)
  const [userLocation, setUserLocation] = useState(null);

  // Load user từ storage khi F5
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
        // Khi F5 lại trang, nếu đã login thì tự động lấy lại vị trí luôn
        refreshLocation();
      } catch (error) {
        console.error("Lỗi parse user", error);
        logout();
      }
    }
    setIsLoading(false);
  }, []);

  // 2. Hàm lấy vị trí thực tế (Browser API)
  const refreshLocation = () => {
    if (!navigator.geolocation) {
      console.warn("Trình duyệt không hỗ trợ Geolocation");
      return;
    }

    // Gọi popup xin quyền
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log("Vị trí tìm thấy:", latitude, longitude);

        // Lưu vào State để dùng chung cho cả App
        setUserLocation([latitude, longitude]);
      },
      (error) => {
        console.error("Không thể lấy vị trí:", error.message);
        // Có thể set vị trí mặc định là Hà Tĩnh nếu muốn
        // setUserLocation([18.3436, 105.9002]);
      },
      { enableHighAccuracy: true } // Lấy chính xác cao (có dùng GPS)
    );
  };

  const login = async (formData) => {
    try {
      const response = await authService.login(formData);
      const userData = response.user;
      const token = response.token || response.accessToken;

      if (userData && token) {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);

        // 3. Kích hoạt lấy vị trí ngay khi Login thành công
        refreshLocation();
      }
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setUserLocation(null); // Xóa vị trí khi thoát
  };

  return (
    // 4. Truyền userLocation và refreshLocation xuống dưới
    <AuthContext.Provider
      value={{ user, login, logout, isLoading, userLocation, refreshLocation }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
