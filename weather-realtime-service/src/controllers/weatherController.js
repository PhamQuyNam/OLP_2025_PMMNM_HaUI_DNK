/**
 * Copyright 2025 Haui.DNK
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 */
const axios = require('axios');

// Lấy dữ liệu thời tiết thời gian thực từ Orion
const getRealtimeWeather = async (req, res) => {
    try {
        // Gọi sang Orion
        // &options=keyValues giúp Orion trả về JSON gọn gàng (bỏ bớt type: Property)
        const orionUrl = `${process.env.ORION_HOST}/ngsi-ld/v1/entities?type=RainObserved&options=keyValues&limit=100`;

        const response = await axios.get(orionUrl);

        // Dữ liệu trả về sẽ là một mảng các trạm đo
        // Ví dụ: [{id: '...', rainVolume: 35.5, location: {...}}, ...]
        res.json(resultFormatter(response.data));

    } catch (error) {
        console.error("Lỗi lấy dữ liệu Orion:", error.message);
        // Nếu Orion chưa chạy hoặc lỗi, trả về mảng rỗng để Frontend không bị crash
        res.json([]);
    }
};
// Hàm phụ trợ: Làm đẹp dữ liệu
const resultFormatter = (data) => {
    return data.map(station => {
        const rain = station.rainVolume || 0;

        // Logic đánh giá sơ bộ trạng thái (để Frontend tô màu)
        let status = "SAFE";
        let color = "GREEN";

        if (rain >= 50) {
            status = "DANGER";
            color = "RED";
        } else if (rain >= 25) {
            status = "WARNING";
            color = "ORANGE";
        } else if (rain > 0) {
            status = "RAINY";
            color = "BLUE";
        }

        return {
            id: station.id,
            name: station.name || "Trạm không tên",
            rain: rain,
            lat: station.location?.coordinates[1],
            lon: station.location?.coordinates[0],
            updatedAt: station.observedAt,

            // 👇 TRƯỜNG MỚI CHO FRONTEND DỄ VẼ
            status: status,
            displayColor: color,
            message: rain === 0 ? "Trời nắng / Không mưa" : `Đang mưa ${rain}mm`
        };
    });
};

module.exports = { getRealtimeWeather };