# Copyright 2025 HaUI.DNK
# Licensed under the Apache License, Version 2.0
# http://www.apache.org/licenses/LICENSE-2.0

import json
import os
import requests
import math
import random

# --- SỬA LỖI: Thay thế import fetch_static_data bằng get_static_metrics ---
from services.geo_service import check_location_risk, get_nearest_waterway, get_static_metrics
from services.environment_service import get_soil_moisture
from services.alert_receiver import send_alert_to_receiver
# Loại bỏ: from services.weather_service import fetch_realtime_data (Không cần)

# Cấu hình
ALERT_SERVICE_API = os.getenv('ALERT_SERVICE_API', 'http://alert-service:3005/internal/receive')
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
THRESHOLDS_FILE = os.path.join(BASE_DIR, 'config', 'thresholds.json')

def load_thresholds():
    try:
        with open(THRESHOLDS_FILE, 'r') as f:
            return json.load(f)
    except Exception as e:
        print(f"❌ Lỗi đọc thresholds.json: {e}")
        return None


# --- HÀM 1. HÀM CHẤM ĐIỂM (Sử dụng cấu trúc thresholds.json mới) ---
def get_risk_score(value, criterion):
    """
    Chấm điểm rủi ro (0, 1, 2) cho một tiêu chí dựa trên ngưỡng.
    """
    if value is None: return 0
    
    T1 = criterion.get('low_range_max')
    T2 = criterion.get('high_range_min')
    is_inverted = criterion.get('is_inverted', False)

    score = 0
    
    if is_inverted:
        # Nguy cơ CAO khi giá trị THẤP (Ví dụ: Độ cao, Khoảng cách sông)
        if value < T2: score = 2
        elif value < T1: score = 1
    else:
        # Nguy cơ CAO khi giá trị CAO (Ví dụ: Mưa, TWI, ISR)
        if value >= T2: score = 2
        elif value >= T1: score = 1
        
    return score


# --- 2. HÀM DỰ BÁO THỜI GIAN ĐẾN (ToA) ---
def calculate_toa(slope_perc, distance_km):
    """
    Ước tính thời gian nước tập trung (Time of Concentration).
    """
    if slope_perc <= 0: slope_perc = 0.1 
    if distance_km <= 0: return 0
    
    L = distance_km * 1000 
    S = slope_perc / 100.0
    
    toa_minutes = 0.0195 * (L**0.77) / (S**0.385) 
    return round(toa_minutes / 60.0, 1) # Trả về giờ


# --- 3. HÀM GỬI CẢNH BÁO (ĐÃ ĐIỀU CHỈNH) ---
def trigger_alert(alert_data):
    # ⚠️ Payload TƯƠNG THÍCH với API của Node.js Alert Service
    payload = {
        "station_name": alert_data.get('station_name'),
        "risk_type": alert_data.get('risk_type'), 
        "level": alert_data.get('level'), 
        "rain_1h": alert_data.get('rain_1h'),
        "description": alert_data.get('description'),
        "rain_24h": alert_data.get("rain_24h", 0),
        # --- Các chỉ số phân tích (Mới) ---
        "flood_score": alert_data.get("flood_score", 0),
        "landslide_score": alert_data.get("landslide_score", 0),
        # Gửi cục context_data (Elevation, TWI, Slope...) sang để Node.js lưu vào JSONB
        "context_data": alert_data.get("context_data", {}),
        # 🟢 THÊM estimated_toa_hours VÀO PAYLOAD GỬI ĐI
        "estimated_toa_hours": alert_data.get('estimated_toa_hours') 
    }
    
    try:
        # ⚠️ GỌI HÀM GỬI CẢNH BÁO TỪ MODULE alert_receiver
        # Bạn đã import send_alert_to_receiver, hãy sử dụng nó!
        send_alert_to_receiver(payload)
        
        print(f"⚡ [ALERT SENT] {alert_data['title']} (Level: {alert_data['level']}) - Đã gửi qua alert_receiver.")
    except Exception as e:
        print(f"❌ Lỗi gửi cảnh báo: {e}")


# --- 4. LOGIC PHÂN TÍCH CHÍNH (analyze_rain_risk) ---
# FIX: Đã sửa tên hàm và tham số đầu vào cho analyze_rain_risk
#==============hàm test======================================
def analyze_rain_risk(rain_data, lat, lon, station_name, station_id):
    config = load_thresholds()
    if not config: return

    # Lấy hồ sơ tĩnh của trạm
    static_metrics = get_static_metrics(station_id) 
    if not static_metrics: 
        print(f"❌ [{station_name}] Không tìm thấy hồ sơ tĩnh cho trạm.")
        return

    # Thu thập dữ liệu ĐỘNG
    rain_1h = rain_data.get('current_rain_1h', 0.0)
    rain_24h = rain_data.get('rain_24h_acc', 0.0)
    soil_moisture = get_soil_moisture(lat, lon) 
    
    # Thu thập dữ liệu TĨNH
    elevation = static_metrics.get('elevation', 0.0)
    slope = static_metrics.get('slope', 0.0)
    twi = static_metrics.get('twi', 0.0)
    water_distance = static_metrics.get('water_distance', 9999.0)
    isr = static_metrics.get('isr', 0.0)

    # #LỌC SƠ BỘ: ĐÃ TẠM THỜI VÔ HIỆU HÓA ĐỂ BUỘC TẠO CẢNH BÁO (DEBUG/TEST MODE)
    # moderate_val = config.get('rainfall', {}).get('moderate', 10.0)
    # if rain_1h < moderate_val and rain_24h < 50:
    #     print(f"✅ [{station_name}] Mưa nhẹ, không cần phân tích chi tiết.")
    #     return
        
    # print(f"🔍 [{station_name}] Mưa 1h={rain_1h:.1f}mm/h, 24h={rain_24h:.1f}mm -> Đang phân tích đa chiều...")


    # A. Phân tích Lũ lụt (Flood)
    # ... (phần logic tính điểm bên dưới không đổi) ...
    
    flood_scores = []
    f_conf = config['flood_criteria']
    
    # 1. Chấm điểm các tiêu chí Lũ lụt (7 tiêu chí)
    flood_scores.append(get_risk_score(rain_24h, f_conf['rain_24h']))
    flood_scores.append(get_risk_score(rain_1h, f_conf['rain_1h']))
    flood_scores.append(get_risk_score(elevation, f_conf['elevation']))
    flood_scores.append(get_risk_score(slope, f_conf['slope']))
    flood_scores.append(get_risk_score(twi, f_conf['twi'])) 
    flood_scores.append(get_risk_score(water_distance, f_conf['water_distance']))
    flood_scores.append(get_risk_score(isr, f_conf['isr']))
    
    flood_score_total = sum(flood_scores)
    
    
    # B. Phân tích Sạt lở (Landslide)
    landslide_scores = []
    l_conf = config['landslide_criteria']
    
    # 1. Chấm điểm tiêu chí Sạt lở (4 tiêu chí: Slope, Rain 24h, Elevation, TWI)
    landslide_scores.append(get_risk_score(rain_24h, l_conf['rain_24h']))
    landslide_scores.append(get_risk_score(elevation, l_conf['elevation']))
    landslide_scores.append(get_risk_score(slope, l_conf['slope']))
    landslide_scores.append(get_risk_score(twi, l_conf['twi'])) 
    
    landslide_score_total = sum(landslide_scores)

    # C. RA QUYẾT ĐỊNH CUỐI CÙNG (Dựa trên tổng điểm)

    MAX_FLOOD_SCORE = len(f_conf) * 2  # 7 tiêu chí x 2 điểm = 14
    MAX_LANDSLIDE_SCORE = len(l_conf) * 2  # 4 tiêu chí x 2 điểm = 8

    # 1. TÍNH CHỈ SỐ RỦI RO (RISK INDEX)
    # Chuẩn hóa về tỷ lệ 0.0 - 1.0 (hoặc 0% - 100%)
    flood_risk_index = flood_score_total / MAX_FLOOD_SCORE
    landslide_risk_index = landslide_score_total / MAX_LANDSLIDE_SCORE

    # 2. RA QUYẾT ĐỊNH CUỐI CÙNG DỰA TRÊN CHỈ SỐ CAO NHẤT
    # Chỉ số rủi ro cuối cùng là chỉ số cao nhất của hai loại (đã chuẩn hóa)
    final_risk_index = max(flood_risk_index, landslide_risk_index)

    # 3. PHÂN CẤP CẢNH BÁO DỰA TRÊN INDEX (0.0 đến 1.0)
    # Bạn không cần dùng MAX_TOTAL_SCORE nữa!
    if final_risk_index >= 0.8:  # 80% rủi ro tối đa
        final_level = "CRITICAL"
    elif final_risk_index >= 0.6:  # 60% rủi ro tối đa
        final_level = "VERY HIGH"
    elif final_risk_index >= 0.4:  # 40% rủi ro tối đa
        final_level = "HIGH"
    else:
        final_level = "LOW"

    # Xác định loại thiên tai chính
    # So sánh hai chỉ số Index đã được chuẩn hóa để xác định Hazard chiếm ưu thế
    disaster_type = "FLOOD" if flood_risk_index >= landslide_risk_index else "LANDSLIDE"

    # Tính toán ToA
    dist_km = static_metrics.get('water_distance', 1000) / 1000.0
    slope_perc = static_metrics.get('slope', 1.0)
    toa = calculate_toa(slope_perc, dist_km)

    # Mô tả
    desc_text = f"Nguy cơ {final_level} {disaster_type} cao do tích lũy điểm rủi ro ({final_risk_index} điểm)."
    desc_text += f" Mưa 24h: {rain_24h}mm. Địa hình dốc: {slope_perc}%."

    # Tạo payload cảnh báo chi tiết
    alert_payload = {
        "title": f"🚨 CẢNH BÁO {disaster_type}: {station_name}",
        "level": final_level,
        "description": desc_text,
        "station_name": station_name,
        "rain_1h": rain_1h,
        "rain_24h": rain_24h,
        "risk_type": disaster_type,
        "flood_score": flood_score_total,
        "landslide_score": landslide_score_total,
        "context_data": {"elevation": elevation, "twi": twi, "isr": isr, "soil_moisture": soil_moisture, "slope": slope},
        "estimated_toa_hours": toa
    }

    trigger_alert(alert_payload)