import requests
import random

# độ ẩm đất
def get_soil_moisture(lat, lon):
    """
    Lấy độ ẩm đất hiện tại từ Open-Meteo
    Trả về: Giá trị m3/m3 (0.0 -> 0.5)
    """
    try:
        url = "https://api.open-meteo.com/v1/forecast"
        params = {
            "latitude": lat,
            "longitude": lon,
            "hourly": "soil_moisture_0_to_7cm",  # Lớp đất mặt (quan trọng cho sạt lở)
            "forecast_days": 1,
            "timezone": "Asia/Bangkok"
        }

        response = requests.get(url, params=params)
        data = response.json()

        # Lấy giá trị của giờ hiện tại
        # Open-Meteo trả về list 24h, ta lấy phần tử đầu tiên (gần nhất) hoặc theo giờ hiện tại
        current_moisture = data['hourly']['soil_moisture_0_to_7cm'][0]

        return current_moisture

    except Exception as e:
        print(f"❌ Lỗi lấy độ ẩm đất: {e}")
        # Trả về giá trị giả lập an toàn nếu lỗi
        return random.uniform(0.2, 0.3)