import requests
import random
from config.settings import API_KEY


def fetch_rain_data(lat, lon):
    """Lấy dữ liệu mưa tại một tọa độ cụ thể"""

    if not API_KEY or API_KEY == "8a79d2955889e2648c6307e5cab1b7d4":
        # Giả lập: Vùng núi (kinh độ < 105.5) thì mưa to hơn đồng bằng
        if lon < 105.5:
            # Random từ 15mm đến 50mm (Sẽ kích hoạt Mức 2 hoặc Mức 3)
            return random.uniform(15, 50)
        else:
            # Random từ 0mm đến 25mm (An toàn hoặc Mức 1)
            return random.uniform(0, 25)

    url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={API_KEY}&units=metric"
    try:
        response = requests.get(url)
        data = response.json()
        if 'rain' in data:
            return data['rain'].get('1h', 0.0)
        return 0.0
    except Exception as e:
        print(f"❌ Lỗi lấy thời tiết: {e}")
        return 0.0