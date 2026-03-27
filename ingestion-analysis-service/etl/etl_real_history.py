
import requests
import psycopg2
from datetime import datetime, timedelta
import json
from config.settings import DB_HOST, DB_NAME, DB_USER, DB_PASS, MONITORING_STATIONS
from services.geo_service import get_impacted_points

# Cấu hình ngưỡng mưa (Đồng bộ với thresholds.json)
# Chúng ta hard-code nhẹ ở đây để script chạy độc lập cho nhanh
THRESHOLDS = {
    "MODERATE": 10.0,
    "HEAVY": 25.0,
    "EXTREME": 40.0
}


def get_open_meteo_history(lat, lon, start_date, end_date):
    """
    Gọi Open-Meteo API để lấy lịch sử mưa (Miễn phí, Không cần Key)
    """
    url = "https://archive-api.open-meteo.com/v1/archive"
    params = {
        "latitude": lat,
        "longitude": lon,
        "start_date": start_date,
        "end_date": end_date,
        "hourly": "rain",  # Chỉ lấy dữ liệu mưa
        "timezone": "Asia/Bangkok"
    }

    try:
        response = requests.get(url, params=params)
        if response.status_code == 200:
            return response.json()
        else:
            print(f"❌ Lỗi API Open-Meteo: {response.status_code}")
            return None
    except Exception as e:
        print(f"❌ Lỗi kết nối: {e}")
        return None


def determine_alert_level(rain_val, risk_type):
    """
    Tái hiện logic phân tích rủi ro có phân loại theo Vùng
    """
    level = None
    desc = ""

    # Xác định từ khóa rủi ro dựa trên risk_type
    risk_keyword = "Sạt lở đất" if risk_type == "LANDSLIDE" else "Ngập lụt/Lũ quét"

    # Logic so sánh ngưỡng
    if rain_val >= THRESHOLDS["EXTREME"]:
        level = "CRITICAL"
        desc = f"Mưa cực lớn {rain_val}mm/h. BÁO ĐỘNG: Nguy cơ {risk_keyword} thảm khốc (Dữ liệu thực tế)."

    elif rain_val >= THRESHOLDS["HEAVY"]:
        level = "HIGH"
        desc = f"Mưa to {rain_val}mm/h. Cảnh báo nguy cơ {risk_keyword} cao (Dữ liệu thực tế)."

    elif rain_val >= THRESHOLDS["MODERATE"]:
        level = "MEDIUM"
        desc = f"Mưa vừa {rain_val}mm/h. Đề phòng {risk_keyword} cục bộ (Dữ liệu thực tế)."

    return level, desc


def import_real_history():
    try:
        conn = psycopg2.connect(host=DB_HOST, database=DB_NAME, user=DB_USER, password=DB_PASS)
        cur = conn.cursor()

        print("🧹 Đang dọn dẹp bảng alert_archive...")
        cur.execute("TRUNCATE TABLE alert_archive RESTART IDENTITY")

        # Lấy dữ liệu
        end_date = datetime.now().strftime("%Y-%m-%d")
        start_date = "2025-01-01"

        total_alerts = 0

        for station in MONITORING_STATIONS:
            print(f"\n📡 Đang tải lịch sử mưa cho trạm: {station['name']}...")

            data = get_open_meteo_history(station['lat'], station['lon'], start_date, end_date)

            if not data or 'hourly' not in data: continue

            times = data['hourly']['time']
            rains = data['hourly']['rain']

            risk_type = "LANDSLIDE" if "Núi" in station['name'] else "FLOOD"

            # 👇 Lấy trước danh sách điểm xung yếu quanh trạm này (bán kính 8km)
            # Vì điểm xung yếu là tĩnh (Static), ta lấy 1 lần dùng cho cả vòng lặp để nhanh
            impacted_points_raw = get_impacted_points(station['lat'], station['lon'], radius_km=8)

            # Chuyển đổi sang JSON string để lưu vào DB
            # Chỉ lấy các trường cần thiết cho nhẹ DB
            impacted_points_json = json.dumps([
                {
                    "name": p['name'],
                    "type": p['type'],
                    "lat": p['lat'],
                    "lon": p['lon']
                }
                for p in impacted_points_raw
            ]) if impacted_points_raw else '[]'

            count_station = 0

            for i in range(len(times)):
                rain_val = rains[i]
                timestamp = times[i]

                if rain_val and rain_val >= THRESHOLDS["MODERATE"]:
                    alert_level, desc = determine_alert_level(rain_val, risk_type)

                    if alert_level:
                        # Thêm tên điểm vào mô tả cho sinh động
                        preview_points = ", ".join([p['name'] for p in impacted_points_raw[:2]])
                        full_desc = f"{desc} Điểm ảnh hưởng: {preview_points}..."

                        query = """
                                INSERT INTO alert_archive 
                                (
                                station_name, 
                                risk_type, 
                                alert_level, 
                                rain_value, 
                                description, 
                                impacted_points, 
                                created_at,
                                original_created_at,
                                status,        
                                approved_by   
                                )
                                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s);
                                """
                        cur.execute(query, (
                            station['name'],
                            risk_type,
                            alert_level,
                            rain_val,
                            full_desc,
                            impacted_points_json,
                            timestamp,  # created_at (Thời điểm ghi vào DB)
                            timestamp,  # original_created_at (Thời điểm xảy ra sự kiện)
                            'APPROVED',  # <--- TRẠNG THÁI: ĐÃ DUYỆT
                            'System Auto-Import'  # <--- NGƯỜI DUYỆT: HỆ THỐNG
                        ))
                        count_station += 1
                        total_alerts += 1

            print(f"   ✅ Đã tái hiện {count_station} cảnh báo kèm điểm chi tiết.")

        conn.commit()
        cur.close()
        conn.close()
        print(f"\n🎉 HOÀN TẤT! Đã lưu {total_alerts} bản ghi lịch sử đầy đủ.")

    except Exception as e:
        print(f"❌ Lỗi Database: {e}")


if __name__ == "__main__":
    import_real_history()