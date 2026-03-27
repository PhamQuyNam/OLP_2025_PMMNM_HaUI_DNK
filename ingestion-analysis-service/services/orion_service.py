import requests
import time
import json
from datetime import datetime
from config.settings import ORION_HOST, ORION_ENTITIES_URL


def wait_for_orion():
    """Chờ cho đến khi Orion khởi động xong"""
    print(f"⏳ Đang tìm Orion tại: {ORION_HOST}...")
    while True:
        try:
            resp = requests.get(f"{ORION_HOST}/version")
            if resp.status_code == 200:
                print("✅ Orion đã Online!")
                break
        except:
            print("zzz Đợi Orion mở cổng...")
        time.sleep(5)


def update_rain_entity(station_info, rain_data): # <--- SỬA CHỮ KÝ HÀM
    """
    station_info: Dict chứa {id, name, lat, lon}
    rain_data: Dict chứa {'current_rain_1h', 'rain_24h_acc'}
    """
    station_id = station_info['id']
    observed_time = datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ') # <-- Sử dụng datetime

    payload_patch = {
        "rainVolume1h": { 
            "type": "Property",
            "value": rain_data.get('current_rain_1h', 0.0), 
            "observedAt": observed_time
        },
        "rainVolume24h": { # Thêm thuộc tính mới
            "type": "Property",
            "value": rain_data.get('rain_24h_acc', 0.0), 
            "observedAt": observed_time
        }
    }

    try:
        url = f"{ORION_ENTITIES_URL}/{station_id}/attrs"
        resp = requests.patch(url, json=payload_patch, headers={'Content-Type': 'application/json'})

        if resp.status_code == 204:
            # FIX: Cập nhật Log hiển thị
            print(f"🚀 [{station_info['name']}] Cập nhật mưa: 1h={rain_data.get('current_rain_1h'):.1f}mm, 24h={rain_data.get('rain_24h_acc'):.1f}mm")
        elif resp.status_code == 404:
            _create_entity(station_info, rain_data)
    except Exception as e:
        print(f"❌ Lỗi kết nối Orion ({station_info['name']}): {e}")


def _create_entity(station_info, rain_data): # <--- SỬA CHỮ KÝ HÀM
    print(f"⚠️ Đang tạo trạm mới: {station_info['name']}...")
    observed_time = datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ')

    new_entity = {
        "id": station_info['id'],
        "type": "RainObserved",
        "name": {"type": "Property", "value": station_info['name']},
        
        "rainVolume1h": {
            "type": "Property", "value": rain_data.get('current_rain_1h', 0.0),
            "observedAt": observed_time
        },
        "rainVolume24h": { # Bổ sung 24h
            "type": "Property", "value": rain_data.get('rain_24h_acc', 0.0),
            "observedAt": observed_time
        },
        
        "location": {
            "type": "GeoProperty",
            "value": { "type": "Point", "coordinates": [station_info['lon'], station_info['lat']] }
        },
        "@context": ["https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context.jsonld"]
    }
    requests.post(ORION_ENTITIES_URL, json=new_entity, headers={'Content-Type': 'application/ld+json'})
    print("🆕 Đã tạo mới thành công!")


# Hàm gửi cảnh báo (DisasterWarning)
def send_alert(title, level, description, impacted_points=None):
    alert_id = f"urn:ngsi-ld:DisasterWarning:{int(time.time())}"
    points_data = []
    if impacted_points:
        for p in impacted_points:
            points_data.append({
                "name": p['name'],
                "type": p['type'],  # SCHOOL, BRIDGE... (để Frontend chọn icon)
                "risk": p['risk'],  # LANDSLIDE, FLOOD
                "lat": p.get('lat'),  # Cần đảm bảo geo_service trả về cái này
                "lon": p.get('lon')
            })

    alert_entity = {
        "id": alert_id,
        "type": "DisasterWarning",
        "alertType": {"type": "Property", "value": title},
        "severity": {"type": "Property", "value": level},  # HIGH, MEDIUM, LOW
        "description": {"type": "Property", "value": description},
        "alertDate": {"type": "Property", "value": datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ')},
        "impactedPoints": {
            "type": "Property",
            "value": points_data
        },
        "@context": ["https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context.jsonld"]
    }
    # Gửi cảnh báo lên Orion
    try:
        requests.post(ORION_ENTITIES_URL, json=alert_entity, headers={'Content-Type': 'application/ld+json'})
        print(f"🚨 ĐÃ GỬI CẢNH BÁO KÈM {len(points_data)} ĐIỂM CHI TIẾT.")
    except Exception as e:
        print(f"❌ Lỗi gửi cảnh báo: {e}")