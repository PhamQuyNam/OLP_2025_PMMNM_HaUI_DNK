# Copyright 2025 Haui.DNK
# Licensed under the Apache License, Version 2.0
# http://www.apache.org/licenses/LICENSE-2.0

import json
import psycopg2
from config.settings import DB_HOST, DB_NAME, DB_USER, DB_PASS


# ---------------------------------------------------------
# HÀM 1: Tra cứu VÙNG RỦI RO (Risk Zones)
# Mục đích: Xác định xem trạm đo nằm trong vùng Sạt lở hay Ngập lụt
# ---------------------------------------------------------
def check_location_risk(lat, lon):
    """
    Hỏi PostGIS: Tọa độ này có nằm trong vùng rủi ro (Polygon) nào không?
    Trả về: Thông tin vùng (Tên, Mức độ, Loại rủi ro) hoặc None
    """
    try:
        conn = psycopg2.connect(host=DB_HOST, database=DB_NAME, user=DB_USER, password=DB_PASS)
        cur = conn.cursor()

        # ST_Contains: Kiểm tra điểm nằm trong vùng
        query = """
            SELECT name, risk_level, risk_type
            FROM risk_zones 
            WHERE ST_Contains(geom, ST_SetSRID(ST_Point(%s, %s), 4326));
        """

        cur.execute(query, (lon, lat))  # PostGIS dùng (Lon, Lat)
        result = cur.fetchone()

        cur.close()
        conn.close()

        if result:
            # Trả về đủ 3 thông tin: Tên, Mức độ (HIGH/MEDIUM), Loại (LANDSLIDE/FLOOD)
            return {"name": result[0], "level": result[1], "type": result[2]}
        return None

    except Exception as e:
        print(f"❌ Lỗi tra cứu Vùng (Risk Zone): {e}")
        return None


# ---------------------------------------------------------
# HÀM 2: Tra cứu ĐIỂM XUNG YẾU (Vulnerable Points) - MỚI
# Mục đích: Tìm danh sách trường học/bệnh viện/cầu cống gần đó
# ---------------------------------------------------------
def get_impacted_points(lat, lon, radius_km=10):
    """
    Hỏi PostGIS: Trong bán kính R (km) có những điểm quan trọng nào?
    Trả về: Danh sách các điểm kèm tọa độ để vẽ lên bản đồ
    """
    try:
        conn = psycopg2.connect(host=DB_HOST, database=DB_NAME, user=DB_USER, password=DB_PASS)
        cur = conn.cursor()

        # Đổi km ra độ (xấp xỉ: 1 độ = 111km)
        radius_deg = radius_km / 111.0

        # ST_DWithin: Tìm các điểm nằm trong khoảng cách cho trước
        # Lấy thêm ST_X (Lon) và ST_Y (Lat) để trả về cho Frontend vẽ Map
        query = """
            SELECT name, type, risk_type, ST_X(geom) as lon, ST_Y(geom) as lat
            FROM vulnerable_points 
            WHERE ST_DWithin(geom, ST_SetSRID(ST_Point(%s, %s), 4326), %s);
        """

        cur.execute(query, (lon, lat, radius_deg))
        rows = cur.fetchall()

        # Chuyển kết quả thành danh sách (List of Dictionaries)
        points = [
            {
                "name": r[0],
                "type": r[1],  # SCHOOL, BRIDGE...
                "risk": r[2],  # LANDSLIDE, FLOOD
                "lon": float(r[3]),
                "lat": float(r[4])
            }
            for r in rows
        ]

        cur.close()
        conn.close()
        return points

    except Exception as e:
        print(f"❌ Lỗi tra cứu Điểm xung yếu: {e}")
        return []

def get_nearest_waterway(lat, lon):
    """
    Tìm con sông gần nhất và tính khoảng cách (mét)
    """
    try:
        conn = psycopg2.connect(host=DB_HOST, database=DB_NAME, user=DB_USER, password=DB_PASS)
        cur = conn.cursor()

        # ST_Distance: Tính khoảng cách
        # <->: Toán tử tìm kiếm hàng xóm gần nhất (KNN) cực nhanh
        query = """
            SELECT name, type, 
                   ST_Distance(
                       geom::geography, 
                       ST_SetSRID(ST_Point(%s, %s), 4326)::geography
                   ) as distance_meters
            FROM waterways
            ORDER BY geom <-> ST_SetSRID(ST_Point(%s, %s), 4326)
            LIMIT 1;
        """

        cur.execute(query, (lon, lat, lon, lat))
        result = cur.fetchone()

        cur.close()
        conn.close()

        if result:
            return {"name": result[0], "type": result[1], "distance": result[2]}
        return None

    except Exception as e:
        print(f"❌ Lỗi tính khoảng cách sông: {e}")
        return None

def save_alert_history(station_name, risk_type, level, rain_val, desc, impacted_points=None):
    """Lưu log cảnh báo kèm danh sách điểm"""
    try:
        conn = psycopg2.connect(host=DB_HOST, database=DB_NAME, user=DB_USER, password=DB_PASS)
        cur = conn.cursor()

        # Chuyển list điểm thành JSON string
        points_json = '[]'
        if impacted_points:
            points_json = json.dumps([
                {"name": p['name'], "type": p['type'], "lat": p.get('lat'), "lon": p.get('lon')}
                for p in impacted_points
            ])

        query = """
            INSERT INTO alert_history (station_name, risk_type, alert_level, rain_value, description, impacted_points)
            VALUES (%s, %s, %s, %s, %s, %s);
        """
        cur.execute(query, (station_name, risk_type, level, float(rain_val), desc, points_json))

        conn.commit()
        cur.close()
        conn.close()
        print(f"💾 Đã lưu lịch sử kèm điểm chi tiết cho {station_name}")
    except Exception as e:
        print(f"❌ Lỗi lưu lịch sử: {e}")