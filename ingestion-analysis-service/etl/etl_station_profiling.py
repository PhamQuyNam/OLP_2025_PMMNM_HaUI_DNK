import requests
import psycopg2
import math
import time

from config.settings import DB_HOST, DB_NAME, DB_USER, DB_PASS

# ---------------------------------------------------------
# HÀM 1: Tính ĐỘ CAO và ĐỘ DỐC (Dùng API Open-Elevation)
# ---------------------------------------------------------
def calculate_topography(lat, lon):
    """
    Lấy độ cao 3 điểm (Tam giác) để tính độ dốc tại chỗ.
    """
    try:
        url = "https://api.open-elevation.com/api/v1/lookup"
        locations = [
            {"latitude": lat, "longitude": lon},  # Điểm A (Trạm)
            {"latitude": lat + 0.001, "longitude": lon},  # Điểm B (Bắc 100m)
            {"latitude": lat, "longitude": lon + 0.001}  # Điểm C (Đông 100m)
        ]

        # Gọi API
        res = requests.post(url, json={"locations": locations}, timeout=30).json()
        elevations = [r['elevation'] for r in res['results']]

        h_a, h_b, h_c = elevations

        # Công thức độ dốc (%) = (Chênh cao / Khoảng cách) * 100
        # Khoảng cách 0.001 độ ~ 111 mét
        slope_pct = math.sqrt(((h_b - h_a) / 111) ** 2 + ((h_c - h_a) / 111) ** 2) * 100

        return h_a, round(slope_pct, 2)
    except:
        print("   ⚠️ Lỗi lấy độ cao, dùng mặc định.")
        return 5.0, 1.0  # Mặc định thấp, phẳng


# ---------------------------------------------------------
# HÀM 2: Tính THỦY VĂN (Dùng PostGIS query bảng waterways)
# ---------------------------------------------------------
def calculate_hydrology(cursor, lat, lon):
    """
    1. Khoảng cách đến sông gần nhất.
    2. Mật độ sông suối trong bán kính 1km.
    """
    # A. Khoảng cách sông (m)
    cursor.execute("""
        SELECT MIN(ST_Distance(geom::geography, ST_SetSRID(ST_Point(%s, %s), 4326)::geography))
        FROM waterways
    """, (lon, lat))
    dist = cursor.fetchone()[0] or 5000  # Nếu không có sông thì coi như xa (5km)

    # B. Mật độ thoát nước (km sông / km2 đất) trong bán kính 1km
    # Diện tích vòng tròn 1km = 3.14 km2
    cursor.execute("""
        SELECT SUM(ST_Length(ST_Intersection(geom::geography, ST_Buffer(ST_SetSRID(ST_Point(%s, %s), 4326)::geography, 1000))))
        FROM waterways
        WHERE ST_DWithin(geom, ST_SetSRID(ST_Point(%s, %s), 4326), 0.01)
    """, (lon, lat, lon, lat))

    length_m = cursor.fetchone()[0] or 0
    density = (length_m / 1000) / 3.14  # Đổi m ra km rồi chia diện tích

    return round(dist, 0), round(density, 2)


# ---------------------------------------------------------
# HÀM 3: Tính BÊ TÔNG HÓA (Dùng Overpass API đếm nhà)
# ---------------------------------------------------------
def calculate_imperviousness(lat, lon):
    overpass_url = "http://overpass-api.de/api/interpreter"
    # Query đếm số tòa nhà
    query = f"""
        [out:json][timeout:25];
        ( node["building"](around:500,{lat},{lon});
          way["building"](around:500,{lat},{lon}); );
        out count;
    """
    try:
        res = requests.get(overpass_url, params={'data': query}, timeout=30)
        if res.status_code != 200:
            # Không thành công: log và trả giá trị mặc định
            print(f"Overpass returned status {res.status_code}: {res.text[:200]}")
            return 30.0

        data = res.json()

        # Overpass khi dùng 'out count' thường trả elements = [{"type":"count", "tags":{"total":"NN"}} , ...]
        total_buildings = 0
        for el in data.get('elements', []):
            tags = el.get('tags') or {}
            t = tags.get('total')
            if t is not None:
                try:
                    total_buildings += int(t)
                except ValueError:
                    pass

        # Nếu không có phần tử 'count', fallback: đôi khi Overpass trả các element thật (node/way),
        # thì ta có thể đếm len(elements) - nhưng với 'out count' thông thường không cần.
        if total_buildings == 0 and data.get('elements'):
            # Defensive fallback: count elements that look like nodes/ways
            total_buildings = sum(1 for el in data['elements'] if el.get('type') in ('node', 'way'))

        # Mapping thresholds -> imperviousness %
        if total_buildings > 250:
            return 90.0  # Trung tâm đô thị đặc
        if total_buildings > 150:
            return 75.0  # Đô thị dày
        if total_buildings > 60:
            return 55.0  # Ven đô
        if total_buildings > 20:
            return 25.0  # Nông thôn dày
        return 10.0  # Nông thôn/Ruộng

    except requests.RequestException as e:
        print(f"Request error to Overpass: {e}")
        return 30.0
    except ValueError as e:
        print(f"JSON parse error: {e}")
        return 30.0

# ---------------------------------------------------------
# HÀM CHÍNH (MAIN LOOP)
# ---------------------------------------------------------
def run_profiling():
    try:
        conn = psycopg2.connect(host=DB_HOST, database=DB_NAME, user=DB_USER, password=DB_PASS)
        cur = conn.cursor()

        print("🔄 Đang lấy danh sách trạm từ Database...")
        query = """
                    SELECT 
                        station_id, 
                        name, 
                        ST_Y(geom) as lat, -- Lấy Vĩ độ (Latitude)
                        ST_X(geom) as lon  -- Lấy Kinh độ (Longitude)
                    FROM monitoring_stations
            """

        cur.execute(query)
        stations = cur.fetchall()

        print(f"📊 Bắt đầu tính toán hồ sơ cho {len(stations)} trạm...")

        for s in stations:
            s_id = s[0]
            s_name = s[1]
            lat = float(s[2])  # Chắc chắn là số thực
            lon = float(s[3])
            print(f"   📍 Xử lý: {s_name}...")

            # 1. Tính Địa hình
            elev, slope = calculate_topography(lat, lon)

            # 2. Tính Thủy văn
            dist_river, drain_dens = calculate_hydrology(cur, lat, lon)

            # 3. Tính Bê tông hóa
            imperv = calculate_imperviousness(lat, lon)

            # 4. Lưu vào bảng Metrics (Upsert - Nếu có rồi thì cập nhật)
            sql = """
                INSERT INTO station_static_metrics 
                (station_id, elevation, slope, dist_to_river, drainage_density, impervious_ratio)
                VALUES (%s, %s, %s, %s, %s, %s)
                ON CONFLICT (station_id) DO UPDATE SET
                elevation = EXCLUDED.elevation,
                slope = EXCLUDED.slope,
                dist_to_river = EXCLUDED.dist_to_river,
                drainage_density = EXCLUDED.drainage_density,
                impervious_ratio = EXCLUDED.impervious_ratio;
            """
            cur.execute(sql, (s_id, elev, slope, dist_river, drain_dens, imperv))

            print(f"✅ Xong: Cao={elev}m | Dốc={slope}% | Sông={dist_river}m | Bê tông={imperv}%")
            time.sleep(1)

        conn.commit()
        cur.close()
        conn.close()
        print("\n🎉 HOÀN TẤT! Đã xây dựng xong hồ sơ dữ liệu tĩnh.")

    except Exception as e:
        print(f"❌ Lỗi: {e}")


if __name__ == "__main__":
    run_profiling()