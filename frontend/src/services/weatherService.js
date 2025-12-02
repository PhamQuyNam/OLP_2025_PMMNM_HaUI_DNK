import axiosClient from "./axiosClient";

const weatherService = {
  // Lấy danh sách trạm đo mưa thời gian thực
  // GET: /weather/realtime
  getRealtimeStations() {
    return axiosClient.get("/weather/realtime");
  },
};

export default weatherService;
