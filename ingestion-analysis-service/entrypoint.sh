#!/bin/sh

# === TÍCH HỢP LOGIC PYTHONPATH CŨ VÀO ENTRYPOINT ===
# Đảm bảo Python có thể tìm thấy các module ngang cấp (config, etl, services)
export PYTHONPATH=$PYTHONPATH:/app 
echo "✅ PYTHONPATH đã được thiết lập."
# ====================================================

DB_HOST=$POSTGRES_HOST
DB_PORT=5432
MAX_RETRIES=15
RETRY_INTERVAL=3

echo "========================================================="
echo "=== 1. CHỜ DATABASE (POSTGIS) SẴN SÀNG ==="
echo "========================================================="

# Vòng lặp chờ PostGIS sẵn sàng (TCP Check)
counter=0
while ! nc -z $DB_HOST $DB_PORT && [ $counter -lt $MAX_RETRIES ]; do
  echo "⏳ Đợi PostGIS ($DB_HOST:$DB_PORT) khởi động... ($counter/$MAX_RETRIES)"
  sleep $RETRY_INTERVAL
  counter=$((counter + 1))
done

if [ $counter -eq $MAX_RETRIES ]; then
  echo "❌ LỖI: PostGIS không phản hồi sau $MAX_RETRIES lần thử. Dừng service."
  exit 1
fi

echo "✅ PostGIS đã sẵn sàng!"

echo "========================================================="
echo "=== 1.5. CHỜ DATA SERVICE SẴN SÀNG (ĐẢM BẢO CÁC BẢNG ĐÃ TỒN TẠI) ==="
echo "========================================================="

counter_ds=0
while ! nc -z data-service 3002 && [ $counter_ds -lt $MAX_RETRIES ]; do
  echo "⏳ Đợi Data Service (data-service:3002) khởi động... ($counter_ds/$MAX_RETRIES)"
  sleep $RETRY_INTERVAL
  counter_ds=$((counter_ds + 1))
done

if [ $counter_ds -eq $MAX_RETRIES ]; then
  echo "❌ LỖI: Data Service không phản hồi sau $MAX_RETRIES lần thử. Dừng service."
  exit 1
fi

echo "✅ Data Service đã sẵn sàng!"

echo "========================================================="
echo "=== 2. KIỂM TRA DỮ LIỆU TĨNH ==="
echo "========================================================="

if python -c "
import psycopg2, sys, os
try:
    conn = psycopg2.connect(host=os.environ.get('POSTGRES_HOST'), dbname=os.environ.get('POSTGRES_DB'), user=os.environ.get('POSTGRES_USER'), password=os.environ.get('POSTGRES_PASSWORD'))
    cur = conn.cursor()
    cur.execute('SELECT count(*) FROM monitoring_stations;')
    count = cur.fetchone()[0]
    sys.exit(0 if count > 0 else 1)
except Exception:
    sys.exit(1)
" 2>/dev/null; then
    echo "✅ Dữ liệu đã tồn tại trong database (Stations > 0). BỎ QUA IMPORT DỮ LIỆU TĨNH."
else
    echo "========================================================="
    echo "=== 3. CHẠY CÁC TÁC VỤ ETL (IMPORT DỮ LIỆU TĨNH TỰ ĐỘNG) ==="
    echo "========================================================="
    
    echo "➡️ B1: Chạy ETL: Import Waterways (Sông/Suối)"
    python -m etl.etl_import_waterways
    
    echo "➡️ B2: Chạy ETL: Import Stations (Trạm Quan Trắc)"
    python -m etl.etl_import_stations
    
    echo "➡️ B3: Chạy ETL: shelters (địa điểm an toàn)"
    python -m etl.etl_import_shelters
    
    echo "➡️ B4: Chạy ETL: Profiling (Tính toán Slope, TWI, ISR...)"
    python -m etl.etl_station_profiling
    
    echo "✅ HOÀN TẤT ETL DỮ LIỆU TĨNH!"
fi

echo "========================================================="
echo "=== 4. KHỞI ĐỘNG FASTAPI SERVER (main.py) ==="
echo "========================================================="

# Lệnh này sẽ khởi động Uvicorn Server và Polling tự động
exec uvicorn main:app --host 0.0.0.0 --port 3000