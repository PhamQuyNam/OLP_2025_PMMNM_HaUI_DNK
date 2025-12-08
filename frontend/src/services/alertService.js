/**
 * Copyright 2025 HaUI.DNK
 *
 * Licensed under the Apache License, Version 2.0
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND.
 */
import axiosClient from "./axiosClient";

const alertService = {
  // 1. Lấy danh sách cảnh báo CHỜ DUYỆT (Dành cho Manager)
  // GET: /alerts/pending
  getPendingAlerts() {
    return axiosClient.get("/alerts/pending");
  },

  // 2. Duyệt hoặc Từ chối cảnh báo (Dành cho Manager)
  // PATCH: /alerts/{id}/review
  // Body: { status: "APPROVED" | "REJECTED", managerName: ... }
  reviewAlert(id, status) {
    // Lấy tên người quản lý từ localStorage (nếu có) hoặc để mặc định
    const user = JSON.parse(localStorage.getItem("user"));
    const managerName = user?.username || "Admin";

    return axiosClient.patch(`/alerts/${id}/review`, {
      status,
      managerName,
    });
  },

  // 3. Lấy danh sách cảnh báo ĐÃ DUYỆT (Dành cho Citizen - Banner/Map)
  // GET: /alerts/citizen
  getCitizenAlerts() {
    return axiosClient.get("/alerts/citizen");
  },
};

export default alertService;
