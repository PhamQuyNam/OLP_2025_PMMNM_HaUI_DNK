# Copyright 2025 Haui.DNK
# Licensed under the Apache License, Version 2.0
# http://www.apache.org/licenses/LICENSE-2.0

import os

# Cấu hình Orion
ORION_HOST = os.getenv('ORION_HOST', 'http://orion:1026')
ORION_ENTITIES_URL = f"{ORION_HOST}/ngsi-ld/v1/entities"

# Cấu hình OpenWeather
API_KEY = os.getenv('OPENWEATHER_API_KEY')
STATION_LAT = 18.3436
STATION_LON = 105.9002
# 👇 MẠNG LƯỚI 10 TRẠM THỦ CÔNG (Rải đều TP Hà Tĩnh)
MONITORING_STATIONS = [
    # --- Trung tâm / nội thành ---
    {"id": "urn:ngsi-ld:RainObserved:HT_01_Center_South", "name": "Trạm 01: Công Viên Lê Duẩn", "lat": 18.3360, "lon": 105.9030,
     "desc": "Trung tâm phía Nam — dân cư đông"},
    {"id": "urn:ngsi-ld:RainObserved:HT_02_Center_North", "name": "Trạm 02: Nguyễn Du - UBND TP", "lat": 18.3560, "lon": 105.9080,
     "desc": "Trung tâm phía Bắc — hành chính"},

    {"id":"urn:ngsi-ld:RainObserved:HT_03_CauCay","name":"Trạm 03: Cầu Cày","lat":18.3650,"lon":105.8900,"desc":"Cửa ngõ Bắc"},
    {"id":"urn:ngsi-ld:RainObserved:HT_04_ThachTrung1","name":"Trạm 04: Thạch Trung 1","lat":18.3720,"lon":105.8970,"desc":"Khu dân cư Bắc"},
    {"id":"urn:ngsi-ld:RainObserved:HT_05_ThachTrung2","name":"Trạm 05: Thạch Trung 2","lat":18.3800,"lon":105.9050,"desc":"Mở rộng Bắc"},
    {"id":"urn:ngsi-ld:RainObserved:HT_06_VanChuong","name":"Trạm 06: Văn Chương","lat":18.3660,"lon":105.9150,"desc":"Cửa ngõ Đông Bắc"},
    {"id":"urn:ngsi-ld:RainObserved:HT_07_ThachDong","name":"Trạm 07: Thạch Đồng","lat":18.3740,"lon":105.9250,"desc":"Ven đô Đông Bắc"},

    {"id": "urn:ngsi-ld:RainObserved:HT_08_ThachLinh", "name": "Trạm 08: Thạch Linh (Bến Xe)", "lat": 18.3490, "lon": 105.8800,
     "desc": "Cửa ngõ Tây"},
    {"id": "urn:ngsi-ld:RainObserved:HT_09_ThachBinh", "name": "Trạm 09: Thạch Bình", "lat": 18.3300, "lon": 105.8600, "desc": "Ngoại ô Tây"},
    {"id": "urn:ngsi-ld:RainObserved:HT_10_TayBac", "name": "Trạm 10: Tây Bắc", "lat": 18.3700, "lon": 105.8650, "desc": "Vùng cao Tây Bắc"},
    {"id": "urn:ngsi-ld:RainObserved:HT_11_NuiDong", "name": "Trạm 11: Núi Động", "lat": 18.3600, "lon": 105.8750, "desc": "Vùng bán sơn địa"},

    # --- Phía Nam / vùng trũng ---
    {"id": "urn:ngsi-ld:RainObserved:HT_12_DaiNai", "name": "Trạm 12: Đại Nài", "lat": 18.3220, "lon": 105.9080, "desc": "Vùng trũng dễ ngập"},
    {"id": "urn:ngsi-ld:RainObserved:HT_13_VanYen", "name": "Trạm 13: Văn Yên", "lat": 18.3150, "lon": 105.9200, "desc": "Ven sông Rào Cái"},
    {"id": "urn:ngsi-ld:RainObserved:HT_14_NamHa", "name": "Trạm 14: Nam Hà", "lat": 18.3250, "lon": 105.8950, "desc": "Khu dân cư Nam"},
    {"id": "urn:ngsi-ld:RainObserved:HT_15_NamDinh", "name": "Trạm 15: Nam Định (ven đô)", "lat": 18.3100, "lon": 105.9050,
     "desc": "Ngoại ô Nam"},
    {"id": "urn:ngsi-ld:RainObserved:HT_16_SongRaoCai", "name": "Trạm 16: Hạ lưu Rào Cái", "lat": 18.3050, "lon": 105.9300,
     "desc": "Hạ lưu sông"},

    {"id": "urn:ngsi-ld:RainObserved:HT_17_ThachQuy", "name": "Trạm 17: Thạch Quý", "lat": 18.3450, "lon": 105.9250, "desc": "Ven đô phía Đông"},
    {"id": "urn:ngsi-ld:RainObserved:HT_18_ThachHung", "name": "Trạm 18: Thạch Hưng (Đê)", "lat": 18.3500, "lon": 105.9350,
     "desc": "Ngoài đê, thoát lũ"},
    {"id": "urn:ngsi-ld:RainObserved:HT_19_DongHoi", "name": "Trạm 19: Động Hồi", "lat": 18.3300, "lon": 105.9400,
     "desc": "Đồng ruộng phía Đông"},

    {"id": "urn:ngsi-ld:RainObserved:HT_20_ThachMon", "name": "Trạm 20: Thạch Môn", "lat": 18.3200, "lon": 105.9500,
     "desc": "Cửa biển phía Đông"},

    {"id": "urn:ngsi-ld:RainObserved:HT_21_ThachKhe_North", "name": "Trạm 21: Thạch Khê Bắc", "lat": 18.3850, "lon": 105.9750,
     "desc": "Ven biển phía Bắc"},
    {"id": "urn:ngsi-ld:RainObserved:HT_22_ThachKhe_Center", "name": "Trạm 22: Thạch Khê Trung", "lat": 18.3700, "lon": 105.9900,
     "desc": "Mỏ sắt cũ / khu dân cư mới"},
    {"id": "urn:ngsi-ld:RainObserved:HT_23_ThachLac", "name": "Trạm 23: Thạch Lạc", "lat": 18.3550, "lon": 106.0000,
     "desc": "Ven biển Đông Nam"},
    {"id": "urn:ngsi-ld:RainObserved:HT_24_ThachVan", "name": "Trạm 24: Thạch Văn", "lat": 18.3400, "lon": 105.9650, "desc": "Đồng ven biển"},
    {"id": "urn:ngsi-ld:RainObserved:HT_25_DongNamBien", "name": "Trạm 25: Ven biển Đông Nam", "lat": 18.3200, "lon": 105.9800,
     "desc": "Khu đê biển"},
]

# Cấu hình Database PostGIS (Để tra cứu vùng nguy cơ)
DB_HOST = os.getenv('POSTGRES_HOST', 'postgis')
DB_NAME = os.getenv('POSTGRES_DB', 'viet_resilience_db')
DB_USER = os.getenv('POSTGRES_USER', 'postgres')
DB_PASS = os.getenv('POSTGRES_PASSWORD', '123456')