# Copyright 2025 HaUI.DNK
# Licensed under the Apache License, Version 2.0
# http://www.apache.org/licenses/LICENSE-2.0

import random

import requests
import json
import psycopg2
from config.settings import DB_HOST, DB_NAME, DB_USER, DB_PASS, MONITORING_STATIONS

# Định nghĩa các loại địa điểm cần "quét" trên bản đồ
INFRASTRUCTURE_TAGS = {
    # 1. Nhà dân (Quan trọng nhất - dù không có tên vẫn phải lấy)
    "HOUSE": ['"building"="yes"', '"building"="residential"', '"building"="house"'],

    # 2. Giao thông (Đường đèo, đường mòn - nơi hay sạt lở ta luy)
    "ROAD": ['"highway"="residential"', '"highway"="path"', '"highway"="unclassified"'],

    # 3. Thủy hệ (Bờ suối, ngầm tràn)
    "WATER": ['"waterway"="stream"', '"waterway"="weir"', '"natural"="water"'],
    "SCHOOL": ['"amenity"="school"', '"amenity"="kindergarten"'],
    "HOSPITAL": ['"amenity"="hospital"', '"amenity"="clinic"'],
    "RESIDENTIAL": ['"place"="hamlet"', '"place"="village"', '"place"="isolated_dwelling"'],
    "DAM": ['"waterway"="dam"', '"waterway"="weir"', '"landuse"="reservoir"'],
    "MARKET": ['"amenity"="marketplace"'],
    "BRIDGE": ['"bridge"="yes"', '"man_made"="bridge"'],
    "GOVERNMENT": ['"amenity"="townhall"', '"office"="government"']
}


def generate_display_name(tags, obj_type):
    """
    Logic thông minh: Nếu không có tên thì tự đặt tên mô tả
    """
    raw_name = tags.get('name', '')

    if raw_name:
        return raw_name

    # Nếu không có tên, tự sinh tên dựa trên loại
    if obj_type == 'HOUSE':
        # Random số nhà giả lập cho sinh động
        return f"Nhà dân (Khu vực {random.randint(1, 9)})"
    elif obj_type == 'ROAD':
        return "Đường dân sinh/Đèo dốc"
    elif obj_type == 'WATER':
        return "Khu vực ven suối/Ngầm tràn"

    return "Điểm dân cư tự phát"

def fetch_osm_points(lat, lon, radius=5000):
    """
    Gọi Overpass API để tìm các điểm xung yếu trong bán kính R (mét)
    """
    # URL của Overpass API (Server miễn phí)
    overpass_url = "http://overpass-api.de/api/interpreter"

    # Xây dựng câu truy vấn Overpass QL
    # Logic: Tìm tất cả Node/Way/Relation có tag mong muốn xung quanh tọa độ
    query_parts = []
    for infra_type, tags in INFRASTRUCTURE_TAGS.items():
        for tag in tags:
            # Cú pháp: node["key"="value"](around:radius, lat, lon);
            query_parts.append(f'node[{tag}](around:{radius},{lat},{lon});')
            query_parts.append(f'way[{tag}](around:{radius},{lat},{lon});')

    query_string = "".join(query_parts)

    # Query đầy đủ: Trả về trung tâm (center) của đối tượng dưới dạng JSON
    full_query = f"""
        [out:json][timeout:25];
        (
            {query_string}
        );
        out center;
    """

    try:
        print(f"📡 Đang quét bản đồ quanh tọa độ {lat}, {lon}...")
        response = requests.get(overpass_url, params={'data': full_query})

        if response.status_code == 200:
            return response.json().get('elements', [])
        else:
            print(f"❌ Lỗi Overpass: {response.status_code}")
            return []
    except Exception as e:
        print(f"❌ Lỗi kết nối: {e}")
        return []


def map_osm_to_db_type(tags):
    place = tags.get('place', '')
    waterway = tags.get('waterway', '')
    landuse = tags.get('landuse', '')
    if 'highway' in tags: return 'ROAD'
    if 'waterway' in tags or 'natural' in tags: return 'WATER'
    """Chuyển đổi tag của OSM sang loại của hệ thống ta"""
    if 'school' in tags.get('amenity', '') or 'kindergarten' in tags.get('amenity', ''):
        return 'SCHOOL'
    if 'hospital' in tags.get('amenity', '') or 'clinic' in tags.get('amenity', ''):
        return 'HOSPITAL'
    if place in ['hamlet', 'village', 'isolated_dwelling']:
        return 'RESIDENTIAL'  # Khu dân cư/Thôn xóm
    if waterway in ['dam', 'weir'] or landuse == 'reservoir':
        return 'DAM'
    if 'marketplace' in tags.get('amenity', ''):
        return 'MARKET'
    if 'yes' in tags.get('bridge', ''):
        return 'BRIDGE'
    return 'OTHER'


def import_points():
    try:
        conn = psycopg2.connect(host=DB_HOST, database=DB_NAME, user=DB_USER, password=DB_PASS)
        cur = conn.cursor()

        # 1. Xóa dữ liệu cũ để làm mới
        print("🧹 Đang làm sạch bảng vulnerable_points...")
        cur.execute("TRUNCATE TABLE vulnerable_points RESTART IDENTITY")

        total_count = 0

        # 2. Duyệt qua từng trạm quan trắc trong settings.py
        for station in MONITORING_STATIONS:
            print(f"\n--- Xử lý trạm: {station['name']} ---")

            # Xác định loại rủi ro dựa trên tên trạm (Logic đơn giản hóa)
            # Vùng núi thì quét rộng hơn (8km), đồng bằng quét hẹp hơn (3km)
            scan_radius = 8000 if "Núi" in station['name'] else 5000
            # Nếu là vùng núi -> Sạt lở, Nếu là TP -> Ngập lụt
            current_risk_type = "LANDSLIDE" if "Núi" in station['name'] else "FLOOD"

            # Quét dữ liệu thực tế bán kính 3km
            elements = fetch_osm_points(station['lat'], station['lon'], radius=scan_radius)

            station_point_count = 0

            for el in elements:
                if station_point_count > 50: break
                tags = el.get('tags', {})
                p_type = map_osm_to_db_type(tags)

                # Hàm sinh tên tự động (Quan trọng!)
                display_name = generate_display_name(tags, p_type)

                # Chỉ lấy những địa điểm CÓ TÊN (để hiển thị cho đẹp)
                p_lat = el.get('lat') or el.get('center', {}).get('lat')
                p_lon = el.get('lon') or el.get('center', {}).get('lon')

                if p_lat and p_lon:
                    query = """
                            INSERT INTO vulnerable_points (name, type, risk_type, geom)
                            VALUES (%s, %s, %s, ST_SetSRID(ST_Point(%s, %s), 4326));
                            """
                    cur.execute(query, (display_name, p_type, current_risk_type, p_lon, p_lat))
                    total_count += 1
                    station_point_count += 1
                    print(f"   ✅ Đã thêm: {display_name} ({p_type})")

        conn.commit()
        cur.close()
        conn.close()
        print(f"\n🎉 HOÀN TẤT! Đã quét được tổng cộng {total_count} điểm xung yếu thực tế.")

    except Exception as e:
        print(f"❌ Lỗi Database: {e}")


if __name__ == "__main__":
    import_points()