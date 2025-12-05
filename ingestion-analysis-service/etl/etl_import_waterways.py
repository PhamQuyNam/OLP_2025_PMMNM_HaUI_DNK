# Copyright 2025 HaUI.DNK
# Licensed under the Apache License, Version 2.0
# http://www.apache.org/licenses/LICENSE-2.0

import requests
import psycopg2
from config.settings import DB_HOST, DB_NAME, DB_USER, DB_PASS, MONITORING_STATIONS


def fetch_osm_waterways(lat, lon, radius=5000):
    """Quét sông suối trong bán kính 5km"""
    overpass_url = "http://overpass-api.de/api/interpreter"

    # Lấy river (sông lớn), stream (suối), canal (kênh)
    query = f"""
        [out:json][timeout:60];
        (
          way["waterway"~"river|stream|canal"](around:{radius},{lat},{lon});
        );
        out geom;
    """
    try:
        response = requests.get(overpass_url, params={'data': query})
        if response.status_code == 200:
            return response.json().get('elements', [])
        return []
    except:
        return []


def import_waterways():
    try:
        conn = psycopg2.connect(host=DB_HOST, database=DB_NAME, user=DB_USER, password=DB_PASS)
        cur = conn.cursor()

        print("🧹 Đang dọn dẹp bảng waterways...")
        cur.execute("TRUNCATE TABLE waterways RESTART IDENTITY")

        count = 0
        for station in MONITORING_STATIONS:
            print(f"\n🌊 Quét sông ngòi quanh {station['name']}...")
            elements = fetch_osm_waterways(station['lat'], station['lon'])

            for el in elements:
                tags = el.get('tags', {})
                name = tags.get('name', 'Sông/Suối không tên')
                w_type = tags.get('waterway', 'stream')

                # Xây dựng LineString từ danh sách các điểm (geometry)
                if 'geometry' in el:
                    points_str = ", ".join([f"{pt['lon']} {pt['lat']}" for pt in el['geometry']])
                    wkt_geom = f"LINESTRING({points_str})"

                    query = """
                        INSERT INTO waterways (name, type, geom)
                        VALUES (%s, %s, ST_GeomFromText(%s, 4326));
                    """
                    cur.execute(query, (name, w_type, wkt_geom))
                    count += 1

        conn.commit()
        cur.close()
        conn.close()
        print(f"\n🎉 Đã nạp {count} đoạn sông suối vào hệ thống.")

    except Exception as e:
        print(f"❌ Lỗi: {e}")


if __name__ == "__main__":
    import_waterways()