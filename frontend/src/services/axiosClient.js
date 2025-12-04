/**
 * Copyright 2025 Haui.DNK
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 */
import axios from "axios";

const axiosClient = axios.create({
  // 👇 QUAN TRỌNG NHẤT: Phải có http://localhost:3001
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// 1. Gửi đi: Tự động đính kèm Token...
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

// 2. Nhận về...
axiosClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    console.error("API Error:", error.response);
    return Promise.reject(error.response?.data || error.message);
  }
);

export default axiosClient;
