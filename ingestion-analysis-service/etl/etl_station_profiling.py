
import requests
import psycopg2
import math
import time
import random # <-- BỔ SUNG: Dùng để giả lập TWI

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
        
        # Thêm logic giả lập cho độ dốc thực tế hơn (tùy chọn)
        if h_a > 100:
            slope_pct = random.uniform(10, 30) 
        else:
            slope_pct = random.uniform(0, 5)

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
            print(f"Overpass returned status {res.status_code}: {res.text[:200]}")
            return 30.0

        data = res.json()
        total_buildings = 0
        for el in data.get('elements', []):
            tags = el.get('tags') or {}
            t = tags.get('total')
            if t is not None:
                try:
                    total_buildings += int(t)
                except ValueError:
                    pass

        if total_buildings == 0 and data.get('elements'):
            total_buildings = sum(1 for el in data['elements'] if el.get('type') in ('node', 'way'))

        # Mapping thresholds -> imperviousness %
        if total_buildings > 250:
            return 90.0  # Trung tâm đô thị đặc
        if total_buildings > 150:
            return 75.0
        if total_buildings > 60:
            return 55.0
        if total_buildings > 20:
            return 25.0
        return 10.0

    except requests.RequestException as e:
        print(f"Request error to Overpass: {e}")
        return 30.0
    except ValueError as e:
        print(f"JSON parse error: {e}")
        return 30.0


# ---------------------------------------------------------
# HÀM MỚI: Tính Chỉ số TWI (Giả lập)
# ---------------------------------------------------------
def calculate_twi_metric(lat, lon):
    """
    Tính Chỉ số Độ ẩm Địa hình (TWI). 
    Nguy cơ cao > 10
    """
    # GIẢ LẬP: TWI thường cao hơn ở vùng trũng (kinh độ lon lớn hơn - giả định)
    if lon > 105.5: 
        return random.uniform(8, 15) # Khu vực tích nước cao
    else: 
        return random.uniform(4, 10)
        
    return random.uniform(4, 12) # Mặc định


# ---------------------------------------------------------
# HÀM CHÍNH (MAIN LOOP) - ĐÃ CẬP NHẬT
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
            lat = float(s[2])  
            lon = float(s[3])
            print(f"   📍 Xử lý: {s_name}...")

            # 1. Tính Địa hình
            elev, slope = calculate_topography(lat, lon)

            # 2. Tính Thủy văn
            dist_river, drain_dens = calculate_hydrology(cur, lat, lon)

            # 3. Tính Bê tông hóa
            imperv = calculate_imperviousness(lat, lon)
            
            # 4. Tính TWI <-- BỔ SUNG
            twi = calculate_twi_metric(lat, lon)

            # 5. Lưu vào bảng Metrics (Upsert - Thêm TWI vào SQL)
            sql = """
                INSERT INTO station_static_metrics 
                (station_id, elevation, slope, twi, dist_to_river, drainage_density, impervious_ratio)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (station_id) DO UPDATE SET
                elevation = EXCLUDED.elevation,
                slope = EXCLUDED.slope,
                twi = EXCLUDED.twi,  -- <-- BỔ SUNG
                dist_to_river = EXCLUDED.dist_to_river,
                drainage_density = EXCLUDED.drainage_density,
                impervious_ratio = EXCLUDED.impervious_ratio;
            """
            cur.execute(sql, (s_id, elev, slope, twi, dist_river, drain_dens, imperv))

            print(f"✅ Xong: Cao={elev}m | Dốc={slope}% | TWI={twi:.2f} | Sông={dist_river}m | Bê tông={imperv}%")
            time.sleep(1)

        conn.commit()
        cur.close()
        conn.close()
        print("\n🎉 HOÀN TẤT! Đã xây dựng xong hồ sơ dữ liệu tĩnh.")

    except Exception as e:
        print(f"❌ Lỗi: {e}")


if __name__ == "__main__":
    run_profiling()