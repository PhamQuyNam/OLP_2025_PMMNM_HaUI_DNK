# services/alert_receiver.py
import requests
import os
import logging

logger = logging.getLogger(__name__)

# ⚠️ THAY THẾ URL NÀY BẰNG URL DỊCH VỤ NODE.JS ALERT THỰC TẾ CỦA BẠN
ALERT_SERVICE_URL = os.environ.get("ALERT_SERVICE_API", "http://alert-service:3005") 

# Đường dẫn API đã được xác định là chính xác theo Swagger
RECEIVE_ENDPOINT = f"{ALERT_SERVICE_URL}/internal/receive"

def send_alert_to_receiver(station_data: dict):
    """
    Hàm gửi dữ liệu cảnh báo tới Alert Service qua API POST: /api/alerts/internal/receive
    """
    
    # Đảm bảo payload tuân thủ yêu cầu của Node.js Alert Service
    payload = {
        "station_name": station_data.get("station_name"),
        "risk_type": station_data.get("risk_type"), 
        "level": station_data.get("level"),         
        "rain_value": station_data.get("rain_value", 0),
        "description": station_data.get("description", "Dự báo rủi ro."),
        "impacted_points": station_data.get("impacted_points", [])
    }

    try:
        logger.info(f"Đang gửi cảnh báo {payload['level']} tới Alert Service cho trạm: {payload['station_name']}")
        
        response = requests.post(
            RECEIVE_ENDPOINT, 
            json=payload,
            timeout=5 # Giảm timeout để không treo luồng
        )
        
        response.raise_for_status() # Bắt lỗi HTTP nếu có
        
        logger.info(f"Alert Service phản hồi thành công: {response.status_code}")
        
    except requests.exceptions.RequestException as e:
        logger.error(f"LỖI: Không thể kết nối hoặc Alert Service trả về lỗi khi gửi cảnh báo: {e}")
        # THÊM LOGIC GHI DỰ PHÒNG HOẶC THỬ LẠI NẾU CẦN