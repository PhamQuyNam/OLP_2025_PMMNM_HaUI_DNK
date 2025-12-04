# Copyright 2025 HaUI.DNK
# Licensed under the Apache License, Version 2.0
# http://www.apache.org/licenses/LICENSE-2.0

import json
import os
import requests
# Import đầy đủ các service vệ tinh
from services.geo_service import check_location_risk, get_impacted_points, get_nearest_waterway
from services.environment_service import get_soil_moisture, get_elevation

ALERT_SERVICE_API = os.getenv('ALERT_SERVICE_API', 'http://alert-service:3005/api/alerts/internal/receive')
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
THRESHOLDS_FILE = os.path.join(BASE_DIR, 'config', 'thresholds.json')


def load_thresholds():
    try:
        with open(THRESHOLDS_FILE, 'r') as f:
            return json.load(f)
    except:
        return None


# --- HÀM GỬI CẢNH BÁO CHUNG ---
def trigger_alert(title, level, desc, station_name, rain, r_type, points):
    payload = {
        "title": title,
        "level": level,
        "description": desc,
        "station_name": station_name,
        "rain_value": rain,
        "risk_type": r_type,
        "impacted_points": points
    }
    try:
        requests.post(ALERT_SERVICE_API, json=payload, timeout=5)
        print(f"⚡ [Analysis] Đã gửi cảnh báo: {title}")
    except Exception as e:
        print(f"❌ [Analysis] Lỗi kết nối Alert Service: {e}")


# --- LOGIC PHÂN TÍCH TỔNG HỢP ---
def analyze_rain_risk(current_rain_value, lat, lon, station_name):
    config = load_thresholds()
    if not config: return

    # 1. Lấy ngưỡng mưa cơ bản
    rain_cfg = config.get('rainfall', {})
    moderate_val = rain_cfg.get('moderate', 10.0)  # 10mm
    heavy_val = rain_cfg.get('heavy', 25.0)  # 25mm
    extreme_val = rain_cfg.get('extreme', 40.0)  # 40mm

    # 2. Lọc sơ bộ (Nếu mưa quá nhỏ thì bỏ qua luôn để tiết kiệm API)
    if current_rain_value < moderate_val: return

    print(f"🔍 [{station_name}] Mưa {current_rain_value:.1f}mm -> Đang phân tích đa chiều...")

    # 3. THU THẬP DỮ LIỆU MÔI TRƯỜNG (Context Data)
    # - Vùng quy hoạch
    risk_zone = check_location_risk(lat, lon)
    # - Điểm xung yếu (Trường học, cầu...)
    impacted_points = get_impacted_points(lat, lon, radius_km=5)
    # - Sông ngòi gần nhất
    water_info = get_nearest_waterway(lat, lon)
    # - Độ ẩm đất (0.0 - 0.5)
    soil_moisture = get_soil_moisture(lat, lon)
    # - Độ cao (m)
    elevation = get_elevation(lat, lon)

    # 4. ĐÁNH GIÁ CÁC YẾU TỐ RỦI RO
    risk_factors = []

    # Yếu tố Đất (Cho sạt lở)
    is_soil_saturated = soil_moisture >= 0.4  # Đất đã no nước (>40%)
    if is_soil_saturated: risk_factors.append(f"đất bão hòa nước ({soil_moisture:.2f})")

    # Yếu tố Sông (Cho ngập lụt)
    is_near_river = False
    if water_info and water_info['distance'] < 500:  # Gần sông < 500m
        is_near_river = True
        risk_factors.append(f"sát bờ {water_info['name']} ({int(water_info['distance'])}m)")

    # Yếu tố Địa hình
    is_lowland = elevation < 6.0  # Vùng trũng
    if is_lowland: risk_factors.append(f"địa hình trũng ({int(elevation)}m)")

    # Chuỗi mô tả nguyên nhân
    factor_msg = f". Nguyên nhân cộng hưởng: {', '.join(risk_factors)}." if risk_factors else ""
    point_msg = f" Các điểm cần bảo vệ: {', '.join([p['name'] for p in impacted_points[:2]])}..." if impacted_points else ""

    # 5. RA QUYẾT ĐỊNH (Decision Making)

    if risk_zone:
        r_type = risk_zone.get('type', 'FLOOD')
        zone_name = risk_zone.get('name')

        # --- KỊCH BẢN A: SẠT LỞ (Vùng Núi) ---
        if r_type == 'LANDSLIDE':
            # Nguy hiểm nhất: Mưa Cực lớn HOẶC (Mưa To + Đất Nhão)
            if current_rain_value >= extreme_val or (current_rain_value >= heavy_val and is_soil_saturated):
                trigger_alert(
                    title=f"SẠT LỞ KHẨN CẤP: {station_name}",
                    level="CRITICAL",
                    desc=f"Nguy cấp! Mưa {current_rain_value:.1f}mm trên nền địa chất yếu.{factor_msg}{point_msg}",
                    station_name=station_name, rain=current_rain_value, r_type=r_type, points=impacted_points
                )
            # Nguy hiểm vừa: Mưa To
            elif current_rain_value >= heavy_val:
                trigger_alert(
                    title=f"CẢNH BÁO SẠT LỞ: {station_name}",
                    level="HIGH",
                    desc=f"Mưa lớn {current_rain_value:.1f}mm tại vùng đồi núi. Đề phòng đất đá sạt trượt.{point_msg}",
                    station_name=station_name, rain=current_rain_value, r_type=r_type, points=impacted_points
                )

        # --- KỊCH BẢN B: NGẬP LỤT (Vùng Trũng) ---
        elif r_type == 'FLOOD':
            # Nguy hiểm nhất: Mưa Cực lớn HOẶC (Mưa To + Gần Sông/Vùng Trũng)
            if current_rain_value >= extreme_val or (current_rain_value >= heavy_val and (is_near_river or is_lowland)):
                trigger_alert(
                    title=f"LŨ LỤT NGHIÊM TRỌNG: {station_name}",
                    level="CRITICAL",
                    desc=f"Nước dâng nhanh! Mưa {current_rain_value:.1f}mm kết hợp thủy triều/lũ.{factor_msg}{point_msg}",
                    station_name=station_name, rain=current_rain_value, r_type=r_type, points=impacted_points
                )
            # Nguy hiểm vừa
            elif current_rain_value >= heavy_val:
                trigger_alert(
                    title=f"NGẬP ÚNG CỤC BỘ: {station_name}",
                    level="HIGH",
                    desc=f"Mưa to {current_rain_value:.1f}mm gây ngập các tuyến đường nội đô.",
                    station_name=station_name, rain=current_rain_value, r_type=r_type, points=impacted_points
                )

    else:
        # --- KỊCH BẢN C: NGOÀI VÙNG QUY HOẠCH ---
        if current_rain_value >= extreme_val:
            trigger_alert(
                title=f"Cảnh báo Mưa bất thường: {station_name}",
                level="MEDIUM",
                desc=f"Mưa rất to {current_rain_value:.1f}mm diện rộng ngoài vùng giám sát.{factor_msg}",
                station_name=station_name, rain=current_rain_value, r_type="UNKNOWN", points=impacted_points
            )