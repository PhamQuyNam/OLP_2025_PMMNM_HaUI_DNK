# Copyright 2025 HaUI.DNK
# Licensed under the Apache License, Version 2.0
# http://www.apache.org/licenses/LICENSE-2.0
import requests
import json


def get_soil_moisture(lat, lon):
    """
    Lấy độ ẩm đất (0-7cm) từ Open-Meteo
    Đơn vị: m³/m³ (0.0 khô cong -> 0.5 bão hòa nước)
    """
    try:
        url = "https://api.open-meteo.com/v1/forecast"
        params = {
            "latitude": lat,
            "longitude": lon,
            "hourly": "soil_moisture_0_to_7cm",
            "forecast_days": 1,
            "timezone": "Asia/Bangkok"
        }
        response = requests.get(url, params=params, timeout=5)
        data = response.json()

        # Lấy giá trị giờ hiện tại
        return data['hourly']['soil_moisture_0_to_7cm'][0]
    except Exception as e:
        print(f"⚠️ Lỗi lấy độ ẩm đất: {e}")
        return 0.3  # Giá trị trung bình giả định


def get_elevation(lat, lon):
    """
    Lấy độ cao so với mực nước biển từ Open-Elevation
    """
    try:
        url = "https://api.open-elevation.com/api/v1/lookup"
        payload = {"locations": [{"latitude": lat, "longitude": lon}]}

        response = requests.post(url, json=payload, timeout=5)
        data = response.json()

        return data['results'][0]['elevation']
    except Exception as e:
        print(f"⚠️ Lỗi lấy độ cao: {e}")
        return 10.0  # Mặc định vùng thấp