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
        "id": "urn:ngsi-ld:RainObserved:Station_HuongSon",
        "name": "Trạm Hương Sơn (Vùng Núi)",
        "lat": 18.4571,
        "lon": 105.3456,
        # Hương Sơn: Mưa thường to hơn, dễ sạt lở
    },
    {
        "id": "urn:ngsi-ld:RainObserved:Station_VuQuang",
        "name": "Trạm Vũ Quang (Vùng Núi)",
        "lat": 18.3426,
        "lon": 105.4351
    },
    {
        "id": "urn:ngsi-ld:RainObserved:Station_TPHaTinh",
        "name": "Trạm TP Hà Tĩnh (Đồng Bằng)",
        "lat": 18.3436,
        "lon": 105.9002
    },
    {
        "id": "urn:ngsi-ld:RainObserved:Station_KyAnh",
        "name": "Trạm Kỳ Anh (Ven Biển)",
        "lat": 18.0796,
        "lon": 106.2939
    }
]
STATION_ID = "urn:ngsi-ld:RainObserved:Station001"
# Cấu hình Database PostGIS (Để tra cứu vùng nguy cơ)
DB_HOST = os.getenv('POSTGRES_HOST', 'postgis')
DB_NAME = os.getenv('POSTGRES_DB', 'viet_resilience_db')
DB_USER = os.getenv('POSTGRES_USER', 'postgres')
DB_PASS = os.getenv('POSTGRES_PASSWORD', '123456')