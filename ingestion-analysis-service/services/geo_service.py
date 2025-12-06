# Copyright 2025 HaUI.DNK
# Licensed under the Apache License, Version 2.0
# http://www.apache.org/licenses/LICENSE-2.0

import json
import psycopg2
from config.settings import DB_HOST, DB_NAME, DB_USER, DB_PASS
# Đã dọn dẹp các dòng import không cần thiết hoặc gây lỗi cấu trúc

# ---------------------------------------------------------
# HÀM 1: Tra cứu VÙNG RỦI RO (Risk Zones)
# ---------------------------------------------------------
def check_location_risk(lat, lon):
    """
    Hỏi PostGIS: Tọa độ này có nằm trong vùng rủi ro (Polygon) nào không?
    """
    try:
        conn = psycopg2.connect(host=DB_HOST, database=DB_NAME, user=DB_USER, password=DB_PASS)
        cur = conn.cursor()
        query = """
            SELECT name, risk_level, risk_type
            FROM risk_zones 
            WHERE ST_Contains(geom, ST_SetSRID(ST_Point(%s, %s), 4326));
        """
        cur.execute(query, (lon, lat))
        result = cur.fetchone()
        cur.close()
        conn.close()
        if result:
            return {"name": result[0], "level": result[1], "type": result[2]}
        return None
    except Exception as e:
        print(f"❌ Lỗi tra cứu Vùng (Risk Zone): {e}")
        return None


# ---------------------------------------------------------
# HÀM 2: Tra cứu ĐIỂM XUNG YẾU (Vulnerable Points)
# ---------------------------------------------------------
def get_impacted_points(lat, lon, radius_km=10):
    """
    Hỏi PostGIS: Trong bán kính R (km) có những điểm quan trọng nào?
    """
    try:
        conn = psycopg2.connect(host=DB_HOST, database=DB_NAME, user=DB_USER, password=DB_PASS)
        cur = conn.cursor()
        radius_deg = radius_km / 111.0
        query = """
            SELECT name, type, risk_type, ST_X(geom) as lon, ST_Y(geom) as lat
            FROM vulnerable_points 
            WHERE ST_DWithin(geom, ST_SetSRID(ST_Point(%s, %s), 4326), %s);
        """
        cur.execute(query, (lon, lat, radius_deg))
        rows = cur.fetchall()
        points = [
            {"name": r[0], "type": r[1], "risk": r[2], "lon": float(r[3]), "lat": float(r[4])}
            for r in rows
        ]
        cur.close()
        conn.close()
        return points
    except Exception as e:
        print(f"❌ Lỗi tra cứu Điểm xung yếu: {e}")
        return []

# ---------------------------------------------------------
# HÀM 3: Tìm Sông gần nhất
# ---------------------------------------------------------
def get_nearest_waterway(lat, lon):
    """
    Tìm con sông gần nhất và tính khoảng cách (mét)
    """
    try:
        conn = psycopg2.connect(host=DB_HOST, database=DB_NAME, user=DB_USER, password=DB_PASS)
        cur = conn.cursor()
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

# ---------------------------------------------------------
# HÀM 4: Tra cứu HỒ SƠ TĨNH (get_static_metrics)
# ---------------------------------------------------------
def get_static_metrics(station_id):
    """
    Hỏi PostGIS: Lấy toàn bộ chỉ số tĩnh (elevation, slope, twi, isr, dist_to_river) đã được tính toán.
    """
    try:
        conn = psycopg2.connect(host=DB_HOST, database=DB_NAME, user=DB_USER, password=DB_PASS)
        cur = conn.cursor()
        query = """
            SELECT 
                elevation, 
                slope, 
                impervious_ratio, 
                dist_to_river,
                twi
            FROM station_static_metrics
            WHERE station_id = %s;
        """
        cur.execute(query, (station_id,))
        result = cur.fetchone()
        cur.close()
        conn.close()
        if result:
            return {
                "elevation": result[0],
                "slope": result[1],
                "isr": result[2], 
                "water_distance": result[3],
                "twi": result[4]
            }
        return None
    except Exception as e:
        print(f"❌ Lỗi tra cứu Static Metrics: {e}")
        return None