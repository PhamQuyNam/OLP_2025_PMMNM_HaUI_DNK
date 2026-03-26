# Copyright 2025 HaUI.DNK
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
    
    {"id": "urn:ngsi-ld:RainObserved:TN_01_TrungTam", "name": "Trạm 01: Trung tâm TP Thái Nguyên", "lat": 21.58700,
     "lon": 105.84000, "desc": "Quảng trường / trung tâm hành chính"},
    {"id": "urn:ngsi-ld:RainObserved:TN_02_TayBac", "name": "Trạm 02: Tây Bắc TP", "lat": 21.60400, "lon": 105.82400,
     "desc": "Khu Tây Bắc, ven dân cư"},
    {"id": "urn:ngsi-ld:RainObserved:TN_03_Bac", "name": "Trạm 03: Bắc Thành Phố", "lat": 21.61800, "lon": 105.84200,
     "desc": "Khu ngoại ô bắc, giáp đê sông"},
    {"id": "urn:ngsi-ld:RainObserved:TN_04_DongBac", "name": "Trạm 04: Đông Bắc", "lat": 21.60250, "lon": 105.86000,
     "desc": "Vùng Đông Bắc thành phố"},
    {"id": "urn:ngsi-ld:RainObserved:TN_05_Dong", "name": "Trạm 05: Đông Thành Phố", "lat": 21.58650, "lon": 105.87000,
     "desc": "Khu ven đô phía Đông"},
    {"id": "urn:ngsi-ld:RainObserved:TN_06_DongNam", "name": "Trạm 06: Đông Nam", "lat": 21.56850, "lon": 105.86200,
     "desc": "Vùng Đông Nam, gần khu dân cư ven sông"},
    {"id": "urn:ngsi-ld:RainObserved:TN_07_Nam", "name": "Trạm 07: Nam Thành Phố", "lat": 21.55200, "lon": 105.84500,
     "desc": "Phía Nam thành phố, vùng thấp trũng"},
    {"id": "urn:ngsi-ld:RainObserved:TN_08_TayNam", "name": "Trạm 08: Tây Nam", "lat": 21.54800, "lon": 105.82800,
     "desc": "Khu Tây Nam, ngoại ô"},
    {"id": "urn:ngsi-ld:RainObserved:TN_09_Tay", "name": "Trạm 09: Tây Thành Phố", "lat": 21.56050, "lon": 105.80800,
     "desc": "Vùng gần cửa ngõ phía Tây"},
    {"id": "urn:ngsi-ld:RainObserved:TN_10_HoNuiCoc_N", "name": "Trạm 10: Hồ Núi Cốc Bắc", "lat": 21.64200,
     "lon": 105.73600, "desc": "Phía Bắc Hồ Núi Cốc (ven hồ)"},
    {"id": "urn:ngsi-ld:RainObserved:TN_11_HoNuiCoc_S", "name": "Trạm 11: Hồ Núi Cốc Nam", "lat": 21.61800,
     "lon": 105.71200, "desc": "Phía Nam / Tây hồ Núi Cốc"},
    {"id": "urn:ngsi-ld:RainObserved:TN_12_CongNghiep", "name": "Trạm 12: Khu công nghiệp phía Bắc", "lat": 21.62400,
     "lon": 105.86300, "desc": "Khu công nghiệp / logistics"},
    {"id": "urn:ngsi-ld:RainObserved:TN_13_GiaoThong", "name": "Trạm 13: Cửa ngõ giao thông Bắc", "lat": 21.63700,
     "lon": 105.84600, "desc": "Gần trục đường cao tốc / cửa ngõ"},
    {"id": "urn:ngsi-ld:RainObserved:TN_14_VienDao", "name": "Trạm 14: Viên đào & công viên", "lat": 21.57850,
     "lon": 105.85350, "desc": "Công viên, khu dân cư ven lòng sông"},
    {"id": "urn:ngsi-ld:RainObserved:TN_15_HocVu", "name": "Trạm 15: Khu học thuật / ĐH", "lat": 21.57300,
     "lon": 105.82000, "desc": "Vùng trường học / khu sinh viên"},
    {"id": "urn:ngsi-ld:RainObserved:TN_16_PhuongDien", "name": "Trạm 16: Phường Điền", "lat": 21.59150,
     "lon": 105.80900, "desc": "Khu dân cư đông, phía Tây trung tâm"},
    {"id": "urn:ngsi-ld:RainObserved:TN_17_HangRao", "name": "Trạm 17: Hàng rào đô thị Bắc", "lat": 21.61450,
     "lon": 105.88000, "desc": "Vùng rìa đô thị, giáp nông nghiệp"},
    {"id": "urn:ngsi-ld:RainObserved:TN_18_KeBo", "name": "Trạm 18: Kè Bờ sông", "lat": 21.59700, "lon": 105.87250,
     "desc": "Khu kè bờ sông/đê, giám sát thoát nước"},
    {"id": "urn:ngsi-ld:RainObserved:TN_19_TamPhu", "name": "Trạm 19: Tam Phú – Ven đô", "lat": 21.56600,
     "lon": 105.83700, "desc": "Vùng ven, giáp khu công nghiệp nhỏ"},
    {"id": "urn:ngsi-ld:RainObserved:TN_20_ChienThang", "name": "Trạm 20: Khu Chợ & Chợ dân sinh", "lat": 21.58780,
     "lon": 105.82680, "desc": "Khu chợ lớn / thương mại ven trung tâm"},

    {"id":"urn:ngsi-ld:RainObserved:ND_01_TrungTam","name":"Trạm 01: TP Nam Định","lat":20.42000,"lon":106.16800,"desc":"Trung tâm hành chính"},
    {"id":"urn:ngsi-ld:RainObserved:ND_02_Bac","name":"Trạm 02: Mỹ Lộc (Bắc)","lat":20.50000,"lon":106.12000,"desc":"Khu phía Bắc tỉnh"},
    {"id":"urn:ngsi-ld:RainObserved:ND_03_DongBac","name":"Trạm 03: Xuân Trường","lat":20.43000,"lon":106.32000,"desc":"Đông Bắc, vùng nông nghiệp"},
    {"id":"urn:ngsi-ld:RainObserved:ND_04_Tay","name":"Trạm 04: Vụ Bản","lat":20.37000,"lon":106.05000,"desc":"Phía Tây, vùng bán sơn địa"},
    {"id":"urn:ngsi-ld:RainObserved:ND_05_Nam","name":"Trạm 05: Hải Hậu","lat":20.10000,"lon":106.25000,"desc":"Phía Nam, khu dân cư đông"},
    {"id":"urn:ngsi-ld:RainObserved:ND_06_VenBien","name":"Trạm 06: Giao Thủy (ven biển)","lat":20.25000,"lon":106.50000,"desc":"Giám sát mưa ven biển"},

    {"id":"urn:ngsi-ld:RainObserved:HN_01_TrungTam","name":"Trạm 01: TP Phủ Lý","lat":20.54500,"lon":105.91200,"desc":"Trung tâm tỉnh"},
    {"id":"urn:ngsi-ld:RainObserved:HN_02_Bac","name":"Trạm 02: Duy Tiên (Bắc)","lat":20.65000,"lon":105.93000,"desc":"Cửa ngõ phía Bắc"},
    {"id":"urn:ngsi-ld:RainObserved:HN_03_Dong","name":"Trạm 03: Lý Nhân (Đông)","lat":20.57000,"lon":106.00000,"desc":"Vùng ven sông Hồng"},
    {"id":"urn:ngsi-ld:RainObserved:HN_04_Tay","name":"Trạm 04: Kim Bảng (Tây)","lat":20.60000,"lon":105.80000,"desc":"Khu đồi núi đá vôi"},
    {"id":"urn:ngsi-ld:RainObserved:HN_05_Nam","name":"Trạm 05: Thanh Liêm (Nam)","lat":20.47000,"lon":105.90000,"desc":"Phía Nam tỉnh"},
    {"id":"urn:ngsi-ld:RainObserved:HN_06_TayNam","name":"Trạm 06: Ba Sao","lat":20.48000,"lon":105.78000,"desc":"Khu du lịch Tam Chúc, núi đá"},
    {"id":"urn:ngsi-ld:RainObserved:HN_07_DongNam","name":"Trạm 07: Bình Lục","lat":20.50000,"lon":105.98000,"desc":"Vùng đồng bằng phía Đông Nam"},

    {"id":"urn:ngsi-ld:RainObserved:NB_01_TrungTam","name":"Trạm 01: TP Ninh Bình","lat":20.25000,"lon":105.97000,"desc":"Trung tâm hành chính"},
    {"id":"urn:ngsi-ld:RainObserved:NB_02_Bac","name":"Trạm 02: Nho Quan (Bắc)","lat":20.35000,"lon":105.75000,"desc":"Vùng núi phía Bắc"},
    {"id":"urn:ngsi-ld:RainObserved:NB_03_DongBac","name":"Trạm 03: Gia Viễn","lat":20.30000,"lon":105.90000,"desc":"Khu đồng bằng"},
    {"id":"urn:ngsi-ld:RainObserved:NB_04_Tay","name":"Trạm 04: Tam Điệp","lat":20.15000,"lon":105.65000,"desc":"Khu núi đá phía Tây"},
    {"id":"urn:ngsi-ld:RainObserved:NB_05_Nam","name":"Trạm 05: Yên Mô","lat":20.10000,"lon":105.95000,"desc":"Phía Nam tỉnh"},
    {"id":"urn:ngsi-ld:RainObserved:NB_06_DongNam","name":"Trạm 06: Kim Sơn","lat":20.05000,"lon":106.00000,"desc":"Vùng ven biển"},
    {"id":"urn:ngsi-ld:RainObserved:NB_07_DacThu","name":"Trạm 07: Tràng An","lat":20.30000,"lon":105.90000,"desc":"Địa hình karst, di sản"},

]

# Cấu hình Database PostGIS (Để tra cứu vùng nguy cơ)
DB_HOST = os.getenv('POSTGRES_HOST', 'postgis')
DB_NAME = os.getenv('POSTGRES_DB', 'viet_resilience_db')
DB_USER = os.getenv('POSTGRES_USER', 'postgres')
DB_PASS = os.getenv('POSTGRES_PASSWORD', '123456')