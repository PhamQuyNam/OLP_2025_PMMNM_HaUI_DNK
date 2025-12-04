/**
 * Copyright 2025 HaUI.DNK
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 */
import axiosClient from "./axiosClient";

const authService = {
  // 1. Đăng ký
  // Link thực: http://localhost:8000/api/auth/register
  register(data) {
    return axiosClient.post("/auth/register", data);
  },

  // 2. Đăng nhập
  // Link thực: http://localhost:8000/api/auth/login
  login(data) {
    return axiosClient.post("/auth/login", data);
  },

  // 3. Cập nhật thông tin (Update)
  // Link thực: http://localhost:8000/api/auth/update
  updateProfile(data) {
    return axiosClient.put("/auth/update", data);
  },

  // 4. Xóa tài khoản (Delete)
  // Link thực: http://localhost:8000/api/auth/delete
  deleteAccount() {
    return axiosClient.delete("/auth/delete");
  },
};

export default authService;
