# Copyright 2025 HaUI.DNK
# Licensed under the Apache License, Version 2.0
# http://www.apache.org/licenses/LICENSE-2.0

import requests
import random
from config.settings import API_KEY

def fetch_rain_data(lat, lon):
    """
    FIXED: Luôn trả về DICTIONARY chứa {current_rain_1h, rain_24h_acc}
    """
    is_mountain = lon < 105.5 

    if not API_KEY or API_KEY == "your_api_key":

        # --- SỬA PHẦN NÀY ĐỂ KÍCH HOẠT CẢNH BÁO ---
        # if is_mountain:
        #     # Kịch bản CRITICAL Sạt lở: Mưa 24h trên 80mm và 1h trên 20mm
        #     rain_1h = random.uniform(25, 40)    # Cao hơn ngưỡng 20mm/h
        #     rain_24h_acc = random.uniform(90, 180) # Cao hơn ngưỡng 80mm
        # else:
        #     # Kịch bản FLOOD/Ngập lụt: Đảm bảo vượt ngưỡng 24h > 50mm
        #     rain_1h = random.uniform(10, 20)
        #     rain_24h_acc = random.uniform(60, 100)
            
        # return {
        #     "current_rain_1h": round(rain_1h, 1),
        #     "rain_24h_acc": round(rain_24h_acc, 1)
        # }
        # --------------------------------

        if is_mountain:
            rain_1h = random.uniform(15, 30)
            rain_24h_acc = random.uniform(80, 150)
        else:
            rain_1h = random.uniform(0, 15)
            rain_24h_acc = random.uniform(20, 70)
            
        return {
            "current_rain_1h": round(rain_1h, 1),
            "rain_24h_acc": round(rain_24h_acc, 1)
        }
        
    # --- LOGIC API THẬT (Đảm bảo trả về Dict) ---
    url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={API_KEY}&units=metric"
    try:
        response = requests.get(url, timeout=5)
        data = response.json()
        rain_1h = data.get('rain', {}).get('1h', 0.0)
        
        rain_24h_acc = rain_1h * 10 
        
        return {
            "current_rain_1h": rain_1h,
            "rain_24h_acc": round(rain_24h_acc, 1)
        }
    except Exception as e:
        print(f"❌ Lỗi lấy thời tiết: {e}")
        return {"current_rain_1h": 0.0, "rain_24h_acc": 0.0}