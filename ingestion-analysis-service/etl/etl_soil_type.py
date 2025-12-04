# Copyright 2025 Haui.DNK
# Licensed under the Apache License, Version 2.0
# http://www.apache.org/licenses/LICENSE-2.0

import requests

# thổ nhưỡng
def get_soil_type(lat, lon):
    """
    Lấy thông tin loại đất từ SoilGrids (ISRIC)
    """
    # Clay (Sét), Sand (Cát), Silt (Bùn)
    url = f"https://rest.isric.org/soilgrids/v2.0/properties/query?lon={lon}&lat={lat}&property=clay&property=sand&depth=0-5cm"

    try:
        res = requests.get(url)
        data = res.json()

        # Lấy % Sét và Cát
        clay = data['properties']['layers'][0]['depths'][0]['values']['mean']
        sand = data['properties']['layers'][1]['depths'][0]['values']['mean']

        return {"clay": clay, "sand": sand}
    except:
        return {"clay": 0, "sand": 0}

# Bạn có thể chạy hàm này 1 lần khi nạp trạm (settings.py)
# và lưu kết quả vào DB để dùng dần.