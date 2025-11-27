import json
import os
import requests
from services.geo_service import check_location_risk, get_impacted_points
ALERT_SERVICE_API = os.getenv('ALERT_SERVICE_API', 'http://alert-service:3005/api/alerts/internal/receive')
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
THRESHOLDS_FILE = os.path.join(BASE_DIR, 'config', 'thresholds.json')


def load_thresholds():
    """Đọc file cấu hình JSON"""
    try:
        with open(THRESHOLDS_FILE, 'r') as f:
            return json.load(f)
    except Exception as e:
        print(f"❌ Lỗi đọc file thresholds.json: {e}")
        return None


def analyze_rain_risk(current_rain_value, lat, lon, station_name):
    """
    Phân tích rủi ro dựa trên:
    1. Lượng mưa hiện tại (current_rain_value)
    2. Vị trí địa lý (lat, lon) -> Tra cứu PostGIS xem đất yếu hay trũng
    3. Tên trạm (station_name) -> Để ghi log/cảnh báo cho rõ
    """
    config = load_thresholds()
    if not config: return

    rain_cfg = config.get('rainfall', {})
    moderate_val = rain_cfg.get('moderate', 10.0)  # > 10mm
    heavy_val = rain_cfg.get('heavy', 25.0)  # > 25mm
    extreme_val = rain_cfg.get('extreme', 40.0)  # > 40mm (Báo động đỏ)

    # 1. Lọc sơ bộ
    if current_rain_value < moderate_val:
        # In ra log để biết là trạm vẫn sống, chỉ là trời đẹp thôi
        print(f"✅ [{station_name}] An toàn ({current_rain_value}mm).")
        return

    print(f"🔍 [{station_name}] Mưa lớn ({current_rain_value:.1f}mm) -> Đang kiểm tra địa hình...")

    # 2. Bước 2: Tra cứu PostGIS với tọa độ ĐỘNG của trạm này
    # (Hỏi xem trạm này nằm ở Hương Sơn hay TP Hà Tĩnh?)
    risk_zone = check_location_risk(lat, lon)

    if risk_zone:
        level = risk_zone.get('level', 'LOW')
        r_type = risk_zone.get('type', 'FLOOD')
        zone_name = risk_zone.get('name', 'Vùng chưa cập nhật')

        impacted_points = get_impacted_points(lat, lon, radius_km=10)

        # --- TRƯỜNG HỢP A: SẠT LỞ (Vùng Núi) ---
        if r_type == 'LANDSLIDE':
            # MỨC 1: Mưa Cực Đoan (> 40mm/1h) -> Sạt lở ngay lập tức
            if current_rain_value >= extreme_val:
                alert_payload = {
                    "title": f"SẠT LỞ KHẨN CẤP: {station_name}",
                    "level": "CRITICAL",
                    "description": f"Mưa {current_rain_value}mm...",
                    "station_name": station_name,
                    "rain_value": current_rain_value,
                    "risk_type": r_type,  # LANDSLIDE/FLOOD
                    "impacted_points": impacted_points
                }
                try:
                    resp = requests.post(ALERT_SERVICE_API, json=alert_payload)
                    if resp.status_code == 200:
                        print(f"✅ [Analysis] Đã gửi cảnh báo sang Alert Service: {station_name}")
                    else:
                        print(f"⚠️ [Analysis] Lỗi từ Alert Service: {resp.text}")
                except Exception as e:
                    print(f"❌ [Analysis] Không kết nối được Alert Service: {e}")

            # MỨC 2: Mưa To (> 25mm/1h) + Vùng nguy hiểm cao (HIGH)
            elif current_rain_value >= heavy_val and level == 'HIGH':
                alert_payload = {
                    "title": f"SẠT LỞ KHẨN CẤP: {station_name}",
                    "level": "HIGH",
                    "description": f"Mưa {current_rain_value}mm...",
                    "station_name": station_name,
                    "rain_value": current_rain_value,
                    "risk_type": r_type,  # LANDSLIDE/FLOOD
                    "impacted_points": impacted_points
                }

                try:
                    resp = requests.post(ALERT_SERVICE_API, json=alert_payload)
                    if resp.status_code == 200:
                        print(f"✅ [Analysis] Đã gửi cảnh báo sang Alert Service: {station_name}")
                    else:
                        print(f"⚠️ [Analysis] Lỗi từ Alert Service: {resp.text}")
                except Exception as e:
                    print(f"❌ [Analysis] Không kết nối được Alert Service: {e}")

            # MỨC 3: Mưa Vừa (> 10mm/1h) -> Cảnh báo sớm
            else:
                alert_payload = {
                    "title": f"SẠT LỞ KHẨN CẤP: {station_name}",
                    "level": "MEDIUM",
                    "description": f"Mưa {current_rain_value}mm...",
                    "station_name": station_name,
                    "rain_value": current_rain_value,
                    "risk_type": r_type,  # LANDSLIDE/FLOOD
                    "impacted_points": impacted_points
                }

                try:
                    resp = requests.post(ALERT_SERVICE_API, json=alert_payload)
                    if resp.status_code == 200:
                        print(f"✅ [Analysis] Đã gửi cảnh báo sang Alert Service: {station_name}")
                    else:
                        print(f"⚠️ [Analysis] Lỗi từ Alert Service: {resp.text}")
                except Exception as e:
                    print(f"❌ [Analysis] Không kết nối được Alert Service: {e}")

        # --- TRƯỜNG HỢP B: NGẬP LỤT (Vùng Trũng/Biển) ---
        elif r_type == 'FLOOD':
            if current_rain_value >= extreme_val:
                alert_payload = {
                    "title": f"SẠT LỞ KHẨN CẤP: {station_name}",
                    "level": "CRITICAL",
                    "description": f"Mưa {current_rain_value}mm...",
                    "station_name": station_name,
                    "rain_value": current_rain_value,
                    "risk_type": r_type,  # LANDSLIDE/FLOOD
                    "impacted_points": impacted_points
                }

                try:
                    resp = requests.post(ALERT_SERVICE_API, json=alert_payload)
                    if resp.status_code == 200:
                        print(f"✅ [Analysis] Đã gửi cảnh báo sang Alert Service: {station_name}")
                    else:
                        print(f"⚠️ [Analysis] Lỗi từ Alert Service: {resp.text}")
                except Exception as e:
                    print(f"❌ [Analysis] Không kết nối được Alert Service: {e}")

            elif current_rain_value >= heavy_val:
                alert_payload = {
                    "title": f"SẠT LỞ KHẨN CẤP: {station_name}",
                    "level": "HIGH",
                    "description": f"Mưa {current_rain_value}mm...",
                    "station_name": station_name,
                    "rain_value": current_rain_value,
                    "risk_type": r_type,  # LANDSLIDE/FLOOD
                    "impacted_points": impacted_points
                }

                try:
                    resp = requests.post(ALERT_SERVICE_API, json=alert_payload)
                    if resp.status_code == 200:
                        print(f"✅ [Analysis] Đã gửi cảnh báo sang Alert Service: {station_name}")
                    else:
                        print(f"⚠️ [Analysis] Lỗi từ Alert Service: {resp.text}")
                except Exception as e:
                    print(f"❌ [Analysis] Không kết nối được Alert Service: {e}")

    else:
        # TRƯỜNG HỢP 3: KHÔNG NẰM TRONG VÙNG RỦI RO (An toàn hoặc chưa cập nhật bản đồ)
        if current_rain_value >= extreme_val:
            print(
                f"⚠️ [{station_name}] Mưa rất to ({current_rain_value:.1f}mm) nhưng trạm nằm ngoài vùng quy hoạch rủi ro.")