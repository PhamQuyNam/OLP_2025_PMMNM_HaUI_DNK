# Copyright 2025 Haui.DNK
# Licensed under the Apache License, Version 2.0
# http://www.apache.org/licenses/LICENSE-2.0

import requests
import json
import psycopg2
import random
from config.settings import DB_HOST, DB_NAME, DB_USER, DB_PASS, MONITORING_STATIONS

# Định nghĩa các địa điểm được coi là "Nơi trú ẩn an toàn"
SHELTER_TAGS = {
    # 1. Y tế (Bệnh viện, Trạm xá) - Ưu tiên số 1
    "HOSPITAL": ['"amenity"="hospital"', '"amenity"="clinic"', '"healthcare"="hospital"'],

    # 2. Trường học (Thường xây kiên cố, cao tầng) - Nơi sơ tán phổ biến
    "SCHOOL": ['"amenity"="school"', '"amenity"="college"', '"amenity"="university"'],

    # 3. Cơ quan chính quyền (UBND, Công an) - An ninh tốt
    "POLICE": ['"amenity"="police"', '"amenity"="fire_station"', '"office"="government"', '"amenity"="townhall"'],

    # 4. Các điểm cao/công cộng khác (Nhà văn hóa, Chùa, Nhà thờ)
    "SHELTER": ['"amenity"="community_centre"', '"amenity"="place_of_worship"', '"amenity"="shelter"']
}


def map_osm_type(tags):
    """Phân loại địa điểm"""
    amenity = tags.get('amenity', '')
    office = tags.get('office', '')
    healthcare = tags.get('healthcare', '')

    if 'hospital' in amenity or 'clinic' in amenity or 'hospital' in healthcare:
        return 'HOSPITAL'
    if 'school' in amenity or 'college' in amenity or 'university' in amenity:
        return 'SCHOOL'
    if 'police' in amenity or 'fire_station' in amenity:
        return 'POLICE'
    if 'government' in office or 'townhall' in amenity:
        return 'POLICE'

    return 'SHELTER'


def fetch_osm_shelters(lat, lon, radius=2000):
    # ... (Giữ nguyên logic gọi API Overpass) ...
    overpass_url = "http://overpass-api.de/api/interpreter"

    query_parts = []
    for s_type, tags in SHELTER_TAGS.items():
        for tag in tags:
            query_parts.append(f'node[{tag}](around:{radius},{lat},{lon});')
            query_parts.append(f'way[{tag}](around:{radius},{lat},{lon});')

    query_string = "".join(query_parts)
    full_query = f"[out:json][timeout:60];({query_string});out center;"

    try:
        print(f"🏥 Đang tìm điểm cứu trợ quanh {lat}, {lon}...")
        response = requests.get(overpass_url, params={'data': full_query})
        if response.status_code == 200:
            return response.json().get('elements', [])
        return []
    except:
        return []


def import_shelters():
    try:
        conn = psycopg2.connect(host=DB_HOST, database=DB_NAME, user=DB_USER, password=DB_PASS)
        cur = conn.cursor()

        print("🧹 Đang làm sạch bảng safe_zones...")
        cur.execute("TRUNCATE TABLE safe_zones RESTART IDENTITY")

        total_count = 0

        for station in MONITORING_STATIONS:
            print(f"\n--- Khu vực: {station['name']} ---")

            elements = fetch_osm_shelters(station['lat'], station['lon'], radius=5000)

            for el in elements:
                tags = el.get('tags', {})
                name = tags.get('name')

                if name:
                    s_type = map_osm_type(tags)

                    # Lấy tọa độ
                    p_lat = el.get('center', {}).get('lat') or el.get('lat')
                    p_lon = el.get('center', {}).get('lon') or el.get('lon')

                    if p_lat and p_lon:
                        # Insert vào bảng safe_zones (Bỏ cột capacity)
                        query = """
                            INSERT INTO safe_zones (name, type, geom)
                            VALUES (%s, %s, ST_SetSRID(ST_Point(%s, %s), 4326));
                        """
                        cur.execute(query, (name, s_type, p_lon, p_lat))
                        total_count += 1
                        print(f"   ✅ Đã thêm: {name} ({s_type})")

        conn.commit()
        cur.close()
        conn.close()
        print(f"\n🎉 HOÀN TẤT! Đã nạp {total_count} điểm cứu trợ an toàn.")

    except Exception as e:
        print(f"❌ Lỗi Database: {e}")


if __name__ == "__main__":
    import_shelters()