# Copyright 2025 HaUI.DNK
# Licensed under the Apache License, Version 2.0
# http://www.apache.org/licenses/LICENSE-2.0

import time
import sys
import os
import uvicorn
from fastapi import FastAPI
from contextlib import asynccontextmanager
import threading 
import logging

# --- FIX PYTHON PATH ---
# Bắt buộc phải có để các module con (api, logic, services) tìm thấy nhau
if os.path.dirname(os.path.abspath(__file__)) not in sys.path:
    sys.path.append(os.path.dirname(os.path.abspath(__file__)))
# --- END FIX ---

# Thiết lập logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Import các logic cốt lõi (KHÔNG CẦN IMPORT api.router ở đây nữa)
from config.settings import MONITORING_STATIONS
from services.orion_service import wait_for_orion, update_rain_entity
from services.weather_service import fetch_rain_data
from logic.risk_analysis import analyze_rain_risk


# --- LOGIC POLLING CŨ (CHẠY LẶP LẠI) ---
def run_job():
    """Chạy một chu trình quét toàn bộ các trạm. Được gọi bởi luồng nền."""
    print(f"\n--- 📡 BẮT ĐẦU QUÉT {len(MONITORING_STATIONS)} TRẠM ---")

    for station in MONITORING_STATIONS:
        station_id = station['id']
        
        # 1. Lấy dữ liệu
        rain_data = fetch_rain_data(station['lat'], station['lon'])

        # 2. Đẩy vào Orion
        update_rain_entity(station, rain_data)

        # 3. Phân tích rủi ro 
        analyze_rain_risk(
            rain_data, 
            station['lat'], 
            station['lon'], 
            station['name'],
            station_id 
        )
        time.sleep(1) 
    logging.info("Polling job finished cycle.")


# --- HÀM CHẠY POLLING LIÊN TỤC TRONG BACKGROUND ---
def continuous_polling_job():
    """Vòng lặp chạy Polling tự động 60s"""
    while True:
        try:
            run_job()
        except Exception as e:
            logging.error(f"Lỗi xảy ra trong quá trình Polling: {e}")
        
        time.sleep(60)


# --- KHỞI TẠO FASTAPI VÀ SERVICE LIFESPAN ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    wait_for_orion()
    logging.info("🚀 Ingestion Service (FastAPI Mode) Started. Starting background polling thread...")

    polling_thread = threading.Thread(target=continuous_polling_job, daemon=True)
    polling_thread.start()
    
    yield
    logging.info("Service shutting down.")


app = FastAPI(
    title="Ingestion & Analysis Service (OLP 2025)", 
    description="Service chịu trách nhiệm thu thập dữ liệu và phân tích rủi ro thiên tai.",
    version="1.0.0",
    docs_url="/api/docs", 
    redoc_url="/api/redoc",
    lifespan=lifespan
)

# SỬA LỖI VÒNG LẶP: THỰC HIỆN IMPORT ROUTER LẠI Ở ĐÂY
# Dòng này bị lỗi vì nó nằm quá sớm trong phiên bản cũ.
from api.router import router as api_router 
app.include_router(api_router, prefix="/api/v1")


if __name__ == "__main__":
    logging.info("🤖 Khởi động Uvicorn Server...")
    uvicorn.run("main:app", host="0.0.0.0", port=3000, log_level="info", reload=False)