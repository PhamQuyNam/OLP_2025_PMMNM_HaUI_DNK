#!/bin/sh

# === TÍCH HỢP LOGIC PYTHONPATH CŨ VÀO ENTRYPOINT (Rất quan trọng) ===
export PYTHONPATH=$PYTHONPATH:/app 
echo "✅ PYTHONPATH đã được thiết lập."
# ====================================================================

DB_HOST=$POSTGRES_HOST
DB_PORT=5432
MAX_RETRIES=15
RETRY_INTERVAL=3

echo "========================================================="
echo "=== 1. CHỜ DATABASE (POSTGIS) SẴN SÀNG ==="
# ... (Logic chờ DB không đổi) ...
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
echo "=== 2. CHẠY CÁC TÁC VỤ ETL (IMPORT DỮ LIỆU TĨNH TỰ ĐỘNG) ==="
echo "========================================================="

# B2. Chạy ETL (Chèn dữ liệu)
echo "➡️ B2: Chạy ETL: Import Waterways (Sông/Suối)"
# FIX: SỬ DỤNG PYTHON MODULE EXECUTION
python -m etl.etl_import_waterways

echo "➡️ B3: Chạy ETL: Import Stations (Trạm Quan Trắc)"
# FIX: SỬ DỤNG PYTHON MODULE EXECUTION
python -m etl.etl_import_stations

echo "➡️ B4: Chạy ETL: Profiling (Tính toán Slope, TWI, ISR...)"
# FIX: SỬ DỤNG PYTHON MODULE EXECUTION
python -m etl.etl_station_profiling

echo "✅ HOÀN TẤT ETL DỮ LIỆU TĨNH!"

echo "========================================================="
echo "=== 3. KHỞI ĐỘNG FASTAPI SERVER (main.py) ==="
echo "========================================================="

# Lệnh này sẽ khởi động Uvicorn Server và Polling tự động
exec uvicorn main:app --host 0.0.0.0 --port 3000