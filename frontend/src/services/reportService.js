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
    return axiosClient.put(`/reports/${id}`, { status: "VERIFIED" });
  },
  // 5. Lấy danh sách báo cáo công khai (GET)
  getPublicReports() {
    return axiosClient.get("/reports/public");
  },
};

export default reportService;
