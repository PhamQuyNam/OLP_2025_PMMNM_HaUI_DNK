
import psycopg2
from config.settings import DB_HOST, DB_NAME, DB_USER, DB_PASS, MONITORING_STATIONS


def import_stations():
    try:
        conn = psycopg2.connect(host=DB_HOST, database=DB_NAME, user=DB_USER, password=DB_PASS)
        cur = conn.cursor()

        print(f"📡 Đang cập nhật danh sách {len(MONITORING_STATIONS)} trạm vào Database...")

        # 1. Xóa dữ liệu cũ (để tránh trùng lặp khi chạy lại)
        cur.execute("TRUNCATE TABLE monitoring_stations RESTART IDENTITY")

        # 2. Duyệt qua list cấu hình và Insert
        for station in MONITORING_STATIONS:
            query = """
                INSERT INTO monitoring_stations (station_id, name, description, geom)
                VALUES (%s, %s, %s, ST_SetSRID(ST_Point(%s, %s), 4326));
            """
            cur.execute(query, (
                station['id'],
                station['name'],
                station.get('desc', ''),
                station['lon'],
                station['lat']
            ))
            print(f"   ✅ Đã nạp: {station['name']}")

        conn.commit()
        cur.close()
        conn.close()
        print("\n🎉 HOÀN TẤT! Đã đồng bộ cấu hình trạm vào PostGIS.")

    except Exception as e:
        print(f"❌ Lỗi Database: {e}")


if __name__ == "__main__":
    import_stations()