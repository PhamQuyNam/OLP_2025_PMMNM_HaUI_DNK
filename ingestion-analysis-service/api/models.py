# Copyright 2025 HaUI.DNK
# Licensed under the Apache License, Version 2.0
# http://www.apache.org/licenses/LICENSE-2.0
from pydantic import BaseModel, Field
from typing import List, Optional

# --- Dữ liệu đầu vào cho API Phân tích Nguy cơ ---
class StaticCriteria(BaseModel):
    """Tiêu chí tĩnh lấy từ hồ sơ trạm."""
    elevation: float = Field(..., description="Độ cao so với mực nước biển (mét)")
    slope: float = Field(..., description="Độ dốc địa hình (%)")
    twi: float = Field(..., description="Chỉ số Độ ẩm Địa hình (TWI)")
    water_distance: float = Field(..., description="Khoảng cách đến sông (mét)")
    isr: float = Field(..., description="Tỷ lệ Bề mặt Không thấm nước (%)")
    # Chúng ta loại bỏ NDVI theo yêu cầu của bạn, chỉ giữ TWI.

class RealtimeCriteria(BaseModel):
    """Tiêu chí thời gian thực."""
    rain_1h: float = Field(..., description="Cường độ mưa Max/giờ (mm/h)")
    rain_24h_acc: float = Field(..., description="Lượng mưa tích lũy 24h (mm)")
    soil_moisture: float = Field(default=0.35, description="Độ ẩm đất (0.0 đến 0.5)")

class ManualAnalysisInput(BaseModel):
    """Mô hình dữ liệu đầu vào cho API phân tích thủ công."""
    location_name: str = Field(..., description="Tên khu vực cần phân tích")
    lat: float = Field(..., description="Vĩ độ (Latitude)")
    lon: float = Field(..., description="Kinh độ (Longitude)")
    
    station_id: Optional[str] = Field(default="MANUAL_STATION", description="ID trạm mô phỏng")
    
    static_criteria: StaticCriteria
    realtime_criteria: RealtimeCriteria

# --- Dữ liệu đầu ra cho API Phân tích Nguy cơ ---
class ImpactedPointOutput(BaseModel):
    """Điểm xung yếu bị ảnh hưởng."""
    name: str
    type: str 
    risk: str 
    lat: float
    lon: float

class AnalysisOutput(BaseModel):
    """Mô hình dữ liệu đầu ra trả về cho nhà quản lý."""
    station_id: str = Field(..., description="ID trạm/vị trí được phân tích")
    station_name: str = Field(..., description="Tên trạm/vị trí được phân tích")

    disaster_type: str = Field(..., description="Loại thiên tai chính (FLOOD/LANDSLIDE/NONE)")
    alert_level: str = Field(..., description="Mức độ cảnh báo (CRITICAL/HIGH/MEDIUM/LOW)")
    flood_score: int = Field(..., description="Tổng điểm rủi ro Lũ lụt (Max 21)")
    landslide_score: int = Field(..., description="Tổng điểm rủi ro Sạt lở (Max 12)")
    estimated_toa_hours: float = Field(..., description="Thời gian thiên tai đến (giờ)")
    
    impact_area_description: str = Field(..., description="Mô tả khu vực/diện tích bị ảnh hưởng")
    impacted_points: List[ImpactedPointOutput]