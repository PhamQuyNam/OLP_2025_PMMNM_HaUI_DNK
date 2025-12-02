import axiosClient from "./axiosClient";

const reportService = {
  // 1. Người dân gửi báo cáo (POST)
  createReport(data) {
    return axiosClient.post("/reports/", data);
  },

  // 2. Quản lý lấy danh sách báo cáo (GET)
  getAllReports() {
    return axiosClient.get("/reports/");
  },
};

export default reportService;
