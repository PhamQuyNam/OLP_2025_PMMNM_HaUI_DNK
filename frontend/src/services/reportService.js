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

const reportService = {
  // 1. Người dân gửi báo cáo (POST)
  createReport(data) {
    return axiosClient.post("/reports/send", data);
  },

  // 2. Quản lý lấy danh sách báo cáo (GET)
  getAllReports() {
    return axiosClient.get("/reports/receive");
  },
  // 3. Xóa báo cáo (DELETE)
  deleteReport(id) {
    return axiosClient.delete(`/reports/${id}`);
  },
  // 4. Duyệt báo cáo (PUT)
  verifyReport(id) {
    // Gửi body JSON { status: "VERIFIED" } lên server
    return axiosClient.put(`/reports/${id}`, { status: "VERIFIED" });
  },
};

export default reportService;
