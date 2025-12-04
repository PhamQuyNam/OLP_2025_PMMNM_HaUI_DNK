# Copyright 2025 Haui.DNK
# Licensed under the Apache License, Version 2.0
# http://www.apache.org/licenses/LICENSE-2.0

import time
from config.settings import MONITORING_STATIONS
from services.orion_service import wait_for_orion, update_rain_entity
from services.weather_service import fetch_rain_data
from logic.risk_analysis import analyze_rain_risk  # Bạn nhớ cập nhật hàm này nhận lat/lon nhé


def run_job():
    print(f"\n--- 📡 BẮT ĐẦU QUÉT {len(MONITORING_STATIONS)} TRẠM ---")

    for station in MONITORING_STATIONS:
        # 1. Lấy dữ liệu tại tọa độ của trạm này
        rain_data = fetch_rain_data(station['lat'], station['lon'])

        # 2. Đẩy vào Orion (Mỗi trạm 1 ID riêng)
        update_rain_entity(station, rain_data)

        # 3. Phân tích rủi ro (Truyền tọa độ để check PostGIS đúng chỗ)
        # Lưu ý: Bạn cần sửa hàm analyze_rain_risk trong logic/risk_analysis.py
        # để nó nhận thêm tham số (rain_value, lat, lon, station_name)
        analyze_rain_risk(rain_data, station['lat'], station['lon'], station['name'])

        time.sleep(1)  # Nghỉ 1s giữa các trạm cho đỡ spam API


if __name__ == "__main__":
    wait_for_orion()
    print("🚀 Ingestion Service (Multi-Station Mode) Started...")
    while True:
        run_job()
        print("😴 Nghỉ 60 giây trước lần quét tiếp theo...")
        time.sleep(60)