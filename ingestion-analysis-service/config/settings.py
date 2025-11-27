import os

# Cấu hình Orion
ORION_HOST = os.getenv('ORION_HOST', 'http://orion:1026')
ORION_ENTITIES_URL = f"{ORION_HOST}/ngsi-ld/v1/entities"

# Cấu hình OpenWeather
API_KEY = os.getenv('OPENWEATHER_API_KEY')
STATION_LAT = 18.3436
STATION_LON = 105.9002
# 👇 NÂNG CẤP: Danh sách các trạm quan trắc chiến lược
MONITORING_STATIONS = [
    {
        "id": "urn:ngsi-ld:RainObserved:HT_Center_Vincom",
        "name": "Trạm Trung Tâm (Vincom)",
        "lat": 18.3436,
        "lon": 105.9002,
        "desc": "Khu vực thương mại sầm uất, ngập gây tắc nghẽn giao thông."
    },
    {
        "id": "urn:ngsi-ld:RainObserved:HT_North_CauCay",
        "name": "Trạm Cầu Cày (Thoát nước Bắc)",
        "lat": 18.3585,
        "lon": 105.8890,
        "desc": "Cửa ngõ thoát nước ra sông Cày. Mực nước tại đây quyết định tốc độ rút nước."
    },
    {
        "id": "urn:ngsi-ld:RainObserved:HT_Lake_BongSon",
        "name": "Trạm Hồ Bồng Sơn",
        "lat": 18.3390,
        "lon": 105.9050,
        "desc": "Hồ điều hòa trung tâm."
    },
    {
        "id": "urn:ngsi-ld:RainObserved:HT_South_DaiNai",
        "name": "Trạm Đại Nài (Vùng trũng Nam)",
        "lat": 18.3250,
        "lon": 105.9080,
        "desc": "Khu vực thấp trũng, chịu ảnh hưởng sớm nhất khi mưa lớn."
    },
    {
        "id": "urn:ngsi-ld:RainObserved:HT_Res_BacHa",
        "name": "Trạm KDC Bắc Hà",
        "lat": 18.3480,
        "lon": 105.8980,
        "desc": "Khu dân cư mật độ cao, hệ thống thoát nước cũ."
    }
]
STATION_ID = "urn:ngsi-ld:RainObserved:Station001"
# Cấu hình Database PostGIS (Để tra cứu vùng nguy cơ)
DB_HOST = os.getenv('POSTGRES_HOST', 'postgis')
DB_NAME = os.getenv('POSTGRES_DB', 'viet_resilience_db')
DB_USER = os.getenv('POSTGRES_USER', 'postgres')
DB_PASS = os.getenv('POSTGRES_PASSWORD', '123456')