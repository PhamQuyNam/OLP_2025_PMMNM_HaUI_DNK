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
  // 3. Quản lý xóa báo cáo (DELETE)
  deleteReport(id) {
    return axiosClient.delete(`/reports/${id}`);
  },
};

export default reportService;
