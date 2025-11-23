import requests
import json
import psycopg2
import time
from config.settings import DB_HOST, DB_NAME, DB_USER, DB_PASS

# Danh sách các khu vực cần lấy dữ liệu thực tế
# Bạn có thể thêm bất cứ huyện/xã nào vào đây
TARGET_ZONES = [
    # --- NHÓM 1: VÙNG NÚI (SẠT LỞ) ---
    {
        "query": "Huyện Hương Sơn, Hà Tĩnh",
        "risk_level": "HIGH",
        "risk_type": "LANDSLIDE",
        "display_name": "Hương Sơn (Nguy cơ Sạt lở cao)",
        "desc": "Địa hình núi cao, dốc đứng, giáp biên giới Lào."
    },
    {
        "query": "Huyện Vũ Quang, Hà Tĩnh",
        "risk_level": "HIGH",
        "risk_type": "LANDSLIDE",
        "display_name": "Vũ Quang (Nguy cơ Sạt lở cao)",
        "desc": "Nằm trong vườn quốc gia Vũ Quang, độ che phủ rừng lớn nhưng địa chất kém ổn định."
    },

    # --- NHÓM 2: VÙNG TRŨNG (NGẬP LỤT) ---
    {
        "query": "Thành phố Hà Tĩnh, Hà Tĩnh",
        "risk_level": "MEDIUM",
        "risk_type": "FLOOD",
        "display_name": "TP Hà Tĩnh (Nguy cơ Ngập lụt)",
        "desc": "Vùng đồng bằng thấp, thường ngập khi hồ Kẻ Gỗ xả lũ."
    },
    {
        "query": "Huyện Kỳ Anh, Hà Tĩnh",
        "risk_level": "HIGH",  # Kỳ Anh ven biển nên nguy cơ cao hơn (Bão/Triều cường)
        "risk_type": "FLOOD",
        "display_name": "Kỳ Anh (Nguy cơ Bão/Lũ)",
        "desc": "Khu vực ven biển, chịu ảnh hưởng trực tiếp của bão và nước dâng."
    }
]


def fetch_geojson_from_osm(query):
    """Gọi API Nominatim để lấy biên giới hành chính"""
    url = "https://nominatim.openstreetmap.org/search"
    params = {
        "q": query,
        "format": "geojson",
        "polygon_geojson": 1,
        "limit": 1
    }
    # User-Agent là bắt buộc khi gọi Nominatim
    headers = {'User-Agent': 'VietResilienceHub/1.0'}

    try:
        print(f"🌍 Đang tải dữ liệu bản đồ: {query}...")
        response = requests.get(url, params=params, headers=headers)
        data = response.json()

        if data and 'features' in data and len(data['features']) > 0:
            # Lấy geometry của kết quả đầu tiên
            return json.dumps(data['features'][0]['geometry'])
        else:
            print(f"❌ Không tìm thấy địa danh: {query}")
            return None
    except Exception as e:
        print(f"❌ Lỗi kết nối OSM: {e}")
        return None


def import_to_postgis():
    """Nạp dữ liệu vào Database"""
    try:
        conn = psycopg2.connect(host=DB_HOST, database=DB_NAME, user=DB_USER, password=DB_PASS)
        cur = conn.cursor()

        # 1. Xóa dữ liệu cũ (để làm sạch)
        print("🧹 Đang dọn dẹp bảng risk_zones...")
        cur.execute("TRUNCATE TABLE risk_zones RESTART IDENTITY")

        # 2. Duyệt qua danh sách và nạp
        for zone in TARGET_ZONES:
            geojson_str = fetch_geojson_from_osm(zone['query'])

            if geojson_str:
                # Câu lệnh SQL chuyên nghiệp sử dụng ST_GeomFromGeoJSON
                query = """
                    INSERT INTO risk_zones (name, risk_level, risk_type, geom)
                    VALUES (%s, %s, %s, ST_SetSRID(ST_GeomFromGeoJSON(%s), 4326));
                """
                cur.execute(query, (zone['display_name'], zone['risk_level'], zone['risk_type'], geojson_str))
                print(f"✅ Đã nạp thành công: {zone['display_name']}")

                # Nominatim yêu cầu rate limit (không gọi quá nhanh)
                time.sleep(1)

        conn.commit()
        cur.close()
        conn.close()
        print("🎉 HOÀN TẤT QUÁ TRÌNH ETL DỮ LIỆU!")

    except Exception as e:
        print(f"❌ Lỗi Database: {e}")


if __name__ == "__main__":
    # Chờ DB khởi động nếu chạy cùng docker-compose (tùy chọn)
    time.sleep(5)
    import_to_postgis()