import axiosClient from "./axiosClient";

const safetyService = {
  // 1. Yêu cầu gửi OTP SOS (Hệ thống tự lấy email từ Token)
  // POST: /safety/sos/request
  requestSosOtp() {
    return axiosClient.post("/safety/sos/request");
  },

  // 2. Gửi tín hiệu SOS kèm OTP và Tọa độ
  // POST: /safety/sos
  sendSosSignal(data) {
    // data = { lat, lon, otp, message, phone }
    return axiosClient.post("/safety/sos", data);
  },
  // GET: /safety/sos/active
  getActiveSOS() {
    return axiosClient.get("/safety/sos/active");
  },
  // PATCH: /safety/sos/:id/resolve
  resolveSOS(id) {
    return axiosClient.patch(`/safety/sos/${id}/resolve`, {
      message: "Đã xác nhận cứu hộ thành công!",
    });
  },
};

export default safetyService;
