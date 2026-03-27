import time
import logging
from fastapi import APIRouter, BackgroundTasks, HTTPException
from pydantic import BaseModel
# --- XÓA DÒNG GÂY LỖI: from main import run_job as run_analysis_job ---
from typing import Optional 

logger = logging.getLogger(__name__)

router = APIRouter()

# Định nghĩa Model cho phản hồi API
class StatusResponse(BaseModel):
    status: str
    message: str

# Định nghĩa Model cho việc kích hoạt phân tích
class TriggerResponse(BaseModel):
    status: str
    message: str
    job_id: str

# ---------------------------------------------------------
# ENDPOINT 1: Lấy Trạng thái Service
# ---------------------------------------------------------
@router.get("/status", response_model=StatusResponse, tags=["Service"])
def get_status():
    """Kiểm tra trạng thái hoạt động của Ingestion & Analysis Service."""
    return StatusResponse(status="OK", message="Ingestion & Analysis Service đang hoạt động.")


# ---------------------------------------------------------
# ENDPOINT 2: Kích hoạt Phân tích Thủ công (SỬ DỤNG LOCAL IMPORT)
# ---------------------------------------------------------
@router.post("/analysis/trigger", response_model=TriggerResponse, tags=["Analysis"])
def trigger_analysis(background_tasks: BackgroundTasks):
    """
    Kích hoạt quá trình quét và phân tích rủi ro đa tiêu chí thủ công.
    Quá trình này chạy ngầm (Background Task) để không làm treo API.
    """
    # FIX: THỰC HIỆN LOCAL IMPORT để phá vỡ vòng lặp
    try:
        from main import run_job as run_analysis_job
    except ImportError:
        logging.error("Lỗi cấu hình: Không thể import run_job từ main.py.")
        raise HTTPException(status_code=500, detail="Lỗi server: Logic phân tích không khả dụng.")

    job_id = f"job-{int(time.time())}"
    logger.info(f"Đã nhận lệnh kích hoạt phân tích thủ công. Job ID: {job_id}")
    
    # Thêm hàm run_job vào background để không chặn luồng chính
    background_tasks.add_task(run_analysis_job)
    
    return TriggerResponse(
        status="PENDING",
        message="Quá trình quét và phân tích rủi ro đã được kích hoạt ngầm (Background Job).",
        job_id=job_id
    )