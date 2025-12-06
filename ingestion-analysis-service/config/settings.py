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

    {"id": "urn:ngsi-ld:RainObserved:HT_26_SonKim", "name": "Trạm 26: Sơn Kim", "lat": 18.4142, "lon": 105.2104,
     "desc": "Xã Sơn Kim 1 – huyện Hương Sơn – vùng núi cao giáp Lào"},
    {"id": "urn:ngsi-ld:RainObserved:HT_27_TaySon", "name": "Trạm 27: Tây Sơn", "lat": 18.3602, "lon": 105.2574,
     "desc": "Vùng núi Tây Sơn, giáp biên giới Lào – rừng núi dày đặc"},
    {"id": "urn:ngsi-ld:RainObserved:HT_28_RaoTre", "name": "Trạm 28: Rào Tre", "lat": 18.1435, "lon": 105.5982,
     "desc": "Khu vực bản Rào Tre – rừng núi Trường Sơn, địa hình cao"},
    {"id": "urn:ngsi-ld:RainObserved:HT_29_NganTrui", "name": "Trạm 29: Hồ Ngàn Trươi", "lat": 18.31560, "lon": 105.47230,
     "desc": "Khu vực hồ Ngàn Trươi – đồi núi bao quanh"},
    {"id": "urn:ngsi-ld:RainObserved:HT_30_DongVoiPhuc", "name": "Trạm 30: Động Voi Phục", "lat": 18.2653, "lon": 105.3879,
     "desc": "Động Voi Phục – vùng núi cao Vũ Quang"},

    {"id":"urn:ngsi-ld:RainObserved:TN_01_TrungTam","name":"Trạm 01: Trung tâm TP Thái Nguyên","lat":21.5935,"lon":105.8487,"desc":"Khu trung tâm – quảng trường Võ Nguyên Giáp"},

    {"id":"urn:ngsi-ld:RainObserved:TN_02_DaiHoc","name":"Trạm 02: Khu Đại học Thái Nguyên","lat":21.5753,"lon":105.8216,"desc":"Khu đại học – sinh viên đông"},

    {"id":"urn:ngsi-ld:RainObserved:TN_03_GangThep","name":"Trạm 03: Gang Thép","lat":21.6020,"lon":105.8430,"desc":"Khu công nghiệp Gang Thép"},

    {"id":"urn:ngsi-ld:RainObserved:TN_04_DuongTuMinh","name":"Trạm 04: Đường Dương Tự Minh","lat":21.6075,"lon":105.8240,"desc":"Khu đô thị phía Bắc"},

    {"id":"urn:ngsi-ld:RainObserved:TN_05_SongCong1","name":"Trạm 05: Ven sông Cống","lat":21.5902,"lon":105.8612,"desc":"Khu vực ven sông – nguy cơ ngập"},

    {"id":"urn:ngsi-ld:RainObserved:TN_06_HoNuiCoc","name":"Trạm 06: Hồ Núi Cốc","lat":21.6347,"lon":105.7205,"desc":"Hồ Núi Cốc – đồi núi thấp bao quanh"},

    {"id":"urn:ngsi-ld:RainObserved:TN_07_VanLang","name":"Trạm 07: Văn Lang","lat":21.6591,"lon":105.7527,"desc":"Đồi núi rừng thông"},

    {"id":"urn:ngsi-ld:RainObserved:TN_08_DinhHoa","name":"Trạm 08: Định Hóa","lat":21.7513,"lon":105.7189,"desc":"Vùng rừng núi hiểm trở"},

    {"id":"urn:ngsi-ld:RainObserved:TN_09_PhuDinh","name":"Trạm 09: Phú Đình","lat":21.7030,"lon":105.7452,"desc":"Đồi núi xen kẽ nương rẫy"},

    {"id":"urn:ngsi-ld:RainObserved:TN_10_BaoLinh","name":"Trạm 10: Bảo Linh","lat":21.7764,"lon":105.7759,"desc":"Vùng cao – mưa rừng mạnh"},

    {"id":"urn:ngsi-ld:RainObserved:TN_11_DaiTu","name":"Trạm 11: Đại Từ","lat":21.6612,"lon":105.6836,"desc":"Khu vực trồng chè – đồi thấp"},

    {"id":"urn:ngsi-ld:RainObserved:TN_12_TanLinh","name":"Trạm 12: Tân Linh","lat":21.6755,"lon":105.6501,"desc":"Đồi chè – khí hậu ẩm"},

    {"id":"urn:ngsi-ld:RainObserved:TN_13_PhuLuong","name":"Trạm 13: Phú Lương","lat":21.8152,"lon":105.7574,"desc":"Vùng đồi núi Bắc Phú Lương"},

    {"id":"urn:ngsi-ld:RainObserved:TN_14_YenLang","name":"Trạm 14: Yên Lãng","lat":21.7254,"lon":105.6890,"desc":"Đồi núi trung du"},

    {"id":"urn:ngsi-ld:RainObserved:TN_15_LucBa","name":"Trạm 15: Lục Ba","lat":21.6305,"lon":105.6503,"desc":"Đồi cao – rừng keo"},

    {"id":"urn:ngsi-ld:RainObserved:TN_16_PhoYen","name":"Trạm 16: Phổ Yên","lat":21.5103,"lon":105.8430,"desc":"Thị xã Phổ Yên – đô thị hóa mạnh"},

    {"id":"urn:ngsi-ld:RainObserved:TN_17_Samsung","name":"Trạm 17: Khu công nghiệp Samsung","lat":21.5135,"lon":105.8772,"desc":"Khu công nghiệp lớn nhất tỉnh"},

    {"id":"urn:ngsi-ld:RainObserved:TN_18_SongCong","name":"Trạm 18: TP Sông Công","lat":21.5459,"lon":105.8302,"desc":"Khu vực ven sông – risk ngập"},

    {"id":"urn:ngsi-ld:RainObserved:TN_19_TanQuang","name":"Trạm 19: Tân Quang","lat":21.5292,"lon":105.8077,"desc":"Đô thị – dân cư đông"},

    {"id":"urn:ngsi-ld:RainObserved:TN_20_BaXuyen","name":"Trạm 20: Bá Xuyên","lat":21.4862,"lon":105.8350,"desc":"Khu dân cư + công nghiệp"},

    {"id":"urn:ngsi-ld:RainObserved:HCM_01_Quan1","name":"Trạm 1: Quận 1","lat":10.7798,"lon":106.6990,"desc":"Khu trung tâm Q1"},
    {"id":"urn:ngsi-ld:RainObserved:HCM_02_Quan4","name":"Trạm 2: Quận 4","lat":10.7520,"lon":106.7130,"desc":"Khu Quận 4 – ven sông"},
    {"id":"urn:ngsi-ld:RainObserved:HCM_03_Quan5","name":"Trạm 3: Quận 5","lat":10.7481,"lon":106.6663,"desc":"Khu Chợ Lớn – Quận 5"},
    {"id":"urn:ngsi-ld:RainObserved:HCM_04_Quan7","name":"Trạm 4: Quận 7","lat":10.7320,"lon":106.7210,"desc":"Khu đô thị Phú Mỹ Hưng"},
    {"id":"urn:ngsi-ld:RainObserved:HCM_05_Quan9","name":"Trạm 5: TP Thủ Đức – Q9","lat":10.8459,"lon":106.8283,"desc":"Khu công nghệ cao Q9"},
    {"id":"urn:ngsi-ld:RainObserved:HCM_06_QuanThuDuc","name":"Trạm 6: TP Thủ Đức – Q.Thủ Đức","lat":10.8693,"lon":106.7585,"desc":"Khu làng ĐH Thủ Đức"},
    {"id":"urn:ngsi-ld:RainObserved:HCM_07_Quan12","name":"Trạm 7: Quận 12","lat":10.8682,"lon":106.6297,"desc":"Khu An Sương – Q12"},
    {"id":"urn:ngsi-ld:RainObserved:HCM_08_GoVap","name":"Trạm 8: Gò Vấp","lat":10.8412,"lon":106.6624,"desc":"Khu Lotte Mart Gò Vấp"},
    {"id":"urn:ngsi-ld:RainObserved:HCM_09_BinhThanh","name":"Trạm 9: Bình Thạnh","lat":10.8089,"lon":106.7094,"desc":"Khu Thanh Đa – Bình Thạnh"},
    {"id":"urn:ngsi-ld:RainObserved:HCM_10_PhuNhuan","name":"Trạm 10: Phú Nhuận","lat":10.8008,"lon":106.6803,"desc":"Khu Phan Xích Long – Phú Nhuận"},

    {"id":"urn:ngsi-ld:RainObserved:HCM_11_TanBinh","name":"Trạm 11: Tân Bình","lat":10.8000,"lon":106.6350,"desc":"Khu sân bay Tân Sơn Nhất"},
    {"id":"urn:ngsi-ld:RainObserved:HCM_12_SonKy","name":"Trạm 12: Sơn Kỳ (Tân Phú Tây)","lat":10.7840,"lon":106.6060,"desc":"Khu Sơn Kỳ – Tây Tân Phú"},
    {"id":"urn:ngsi-ld:RainObserved:HCM_13_BinhTan","name":"Trạm 13: Bình Tân","lat":10.7650,"lon":106.6030,"desc":"Khu Aeon Mall Bình Tân"},
    {"id":"urn:ngsi-ld:RainObserved:HCM_14_BinhChanh","name":"Trạm 14: Bình Chánh","lat":10.7400,"lon":106.5600,"desc":"Khu Tân Kiên – Bình Chánh"},
    {"id":"urn:ngsi-ld:RainObserved:HCM_15_HocMon","name":"Trạm 15: Hóc Môn","lat":10.8850,"lon":106.5900,"desc":"Khu trung tâm Hóc Môn"},
    {"id":"urn:ngsi-ld:RainObserved:HCM_16_CuChi","name":"Trạm 16: Củ Chi","lat":10.9730,"lon":106.4950,"desc":"Khu địa đạo Củ Chi"},
    {"id":"urn:ngsi-ld:RainObserved:HCM_17_NhaBe","name":"Trạm 17: Nhà Bè","lat":10.6920,"lon":106.7350,"desc":"Khu Phú Xuân – Nhà Bè"},
    {"id":"urn:ngsi-ld:RainObserved:HCM_18_CanGio","name":"Trạm 18: Cần Giờ","lat":10.5260,"lon":106.7910,"desc":"Khu rừng ngập mặn Cần Giờ"},
    {"id":"urn:ngsi-ld:RainObserved:HCM_19_ThuDucLinhTrung","name":"Trạm 19: Thủ Đức – Linh Trung","lat":10.8750,"lon":106.7730,"desc":"Khu Linh Trung – Thủ Đức"},
    {"id":"urn:ngsi-ld:RainObserved:HCM_20_Quan10","name":"Trạm 20: Quận 10","lat":10.7703,"lon":106.6683,"desc":"Khu cư xá Bắc Hải – Q10"},

]

# Cấu hình Database PostGIS (Để tra cứu vùng nguy cơ)
DB_HOST = os.getenv('POSTGRES_HOST', 'postgis')
DB_NAME = os.getenv('POSTGRES_DB', 'viet_resilience_db')
DB_USER = os.getenv('POSTGRES_USER', 'postgres')
DB_PASS = os.getenv('POSTGRES_PASSWORD', '123456')