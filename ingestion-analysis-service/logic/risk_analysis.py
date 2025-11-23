import json
import os
from services.orion_service import send_alert
from services.geo_service import check_location_risk, get_impacted_points, save_alert_history

# Đường dẫn tuyệt đối tới file JSON
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
                send_alert(
                    title=f"SẠT LỞ KHẨN CẤP (Mức độ 3): {station_name}",
                    level="CRITICAL",
                    description=f"Mưa cực lớn {current_rain_value:.1f}mm/h. Cảnh báo sạt lở đất nghiêm trọng tại {zone_name}",
                    impacted_points=impacted_points
                )
                # Ghi sổ (Lưu Lịch sử)
                save_alert_history(
                    station_name=station_name,
                    risk_type="LANDSLIDE",
                    level="CRITICAL",
                    rain_val=current_rain_value,
                    desc=f"Mưa cực lớn {current_rain_value}mm/h. Cảnh báo sạt lở đất nghiêm trọng tại {zone_name}",
                    impacted_points=impacted_points  # Lưu cả danh sách điểm vào lịch sử
                )
            # MỨC 2: Mưa To (> 25mm/1h) + Vùng nguy hiểm cao (HIGH)
            elif current_rain_value >= heavy_val and level == 'HIGH':
                send_alert(
                    title=f"CẢNH BÁO SẠT LỞ (Mức độ 2): {station_name}",
                    level="HIGH",
                    description=f"Mưa to {current_rain_value:.1f}mm/h trên đất dốc. Chuẩn bị phương án sơ tán",
                    impacted_points=impacted_points
                )
                save_alert_history(
                    station_name=station_name,
                    risk_type="LANDSLIDE",
                    level="HIGH",
                    rain_val=current_rain_value,
                    desc=f"Mưa to {current_rain_value:.1f}mm/h trên đất dốc. Chuẩn bị phương án sơ tán",
                    impacted_points=impacted_points  # Lưu cả danh sách điểm vào lịch sử
                )
            # MỨC 3: Mưa Vừa (> 10mm/1h) -> Cảnh báo sớm
            else:
                send_alert(
                    title=f"Cảnh báo sớm Sạt lở: {station_name}",
                    level="MEDIUM",
                    description=f"Mưa đang tăng ({current_rain_value:.1f}mm/h). Đất đang bão hòa nước.",
                    impacted_points=impacted_points
                )
                save_alert_history(
                    station_name=station_name,
                    risk_type="LANDSLIDE",
                    level="MEDIUM",
                    rain_val=current_rain_value,
                    desc=f"Mưa đang tăng ({current_rain_value:.1f}mm/h). Đất đang bão hòa nước.",
                    impacted_points=impacted_points  # Lưu cả danh sách điểm vào lịch sử
                )
        # --- TRƯỜNG HỢP B: NGẬP LỤT (Vùng Trũng/Biển) ---
        elif r_type == 'FLOOD':
            if current_rain_value >= extreme_val:
                 send_alert(
                    title=f"NGẬP LỤT NGHIÊM TRỌNG: {station_name}",
                    level="CRITICAL",
                    description=f"Mưa xối xả {current_rain_value:.1f}mm/h. Ngập sâu diện rộng tại {zone_name}",
                    impacted_points=impacted_points
                 )
                 save_alert_history(
                     station_name=station_name,
                     risk_type="FLOOD",
                     level="CRITICAL",
                     rain_val=current_rain_value,
                     desc=f"Mưa xối xả {current_rain_value:.1f}mm/h. Ngập sâu diện rộng tại {zone_name}",
                     impacted_points=impacted_points  # Lưu cả danh sách điểm vào lịch sử
                 )
            elif current_rain_value >= heavy_val:
                 send_alert(
                    title=f"Cảnh báo Ngập úng: {station_name}",
                    level="HIGH",
                    description=f"Mưa to {current_rain_value:.1f}mm/h gây ngập các tuyến đường thấp.",
                    impacted_points=impacted_points
                 )
                 save_alert_history(
                     station_name=station_name,
                     risk_type="FLOOD",
                     level="HIGH",
                     rain_val=current_rain_value,
                     desc=f"Mưa to {current_rain_value:.1f}mm/h gây ngập các tuyến đường thấp.",
                     impacted_points=impacted_points  # Lưu cả danh sách điểm vào lịch sử
                 )
    else:
        # TRƯỜNG HỢP 3: KHÔNG NẰM TRONG VÙNG RỦI RO (An toàn hoặc chưa cập nhật bản đồ)
        if current_rain_value >= extreme_val:
            print(
                f"⚠️ [{station_name}] Mưa rất to ({current_rain_value:.1f}mm) nhưng trạm nằm ngoài vùng quy hoạch rủi ro.")
            # Có thể gửi cảnh báo nhẹ nếu muốn
            send_alert(
                title=f"Cảnh báo mưa lớn: {station_name}",
                level="MEDIUM",
                description=f"Mưa {current_rain_value:.1f}mm tại khu vực chưa phân loại rủi ro."
            )