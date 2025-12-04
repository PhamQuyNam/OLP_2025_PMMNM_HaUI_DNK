/**
 * Copyright 2025 Haui.DNK
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 */
import axiosClient from "./axiosClient";

const weatherService = {
  // Lấy danh sách trạm đo mưa thời gian thực
  // GET: /weather/realtime
  getRealtimeStations() {
    return axiosClient.get("/weather/realtime");
  },
};

export default weatherService;
