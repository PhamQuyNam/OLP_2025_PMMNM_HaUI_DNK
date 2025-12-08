<!--
  Copyright 2025 HaUI.DNK
  Licensed under the Apache License, Version 2.0
  http://www.apache.org/licenses/LICENSE-2.0
-->
---
sidebar_position: 8
title: Ingestion & Analysis (Thu thập & Phân tích)
---

**Ingestion & Analysis Service** là "bộ não" xử lý trung tâm của hệ thống **Viet-Resilience Hub**. Dịch vụ này chịu trách nhiệm thu thập dữ liệu thô từ nhiều nguồn khác nhau (cảm biến, vệ tinh, bản đồ mở), chuẩn hóa chúng và thực thi các thuật toán đánh giá rủi ro để phát hiện thiên tai sớm.

---

## 1. Mục tiêu & Chức năng 🎯

Mục tiêu chính của Service này bao gồm:

- **Thu thập Dữ liệu Đa nguồn (Multi-source Ingestion):**
    - Kết nối với các API khí tượng toàn cầu (Open-Meteo, OpenWeatherMap) để lấy dữ liệu mưa, độ ẩm đất theo thời gian thực.
    - Khai thác dữ liệu địa lý mở (OpenStreetMap, Nominatim, Photon) để tự động xây dựng bản đồ hành chính và hạ tầng.
- **Quy trình ETL Tự động (Extract - Transform - Load):**
    - Chạy các script định kỳ để làm giàu dữ liệu (Data Enrichment) cho cơ sở dữ liệu PostGIS.
    - Tính toán các chỉ số chuyên sâu như: Độ dốc (Slope), Mật độ thoát nước, Tỷ lệ bê tông hóa.
- **Phân tích Rủi ro Thông minh (Risk Analysis Logic):**
    - Áp dụng mô hình Thủy văn - Địa chất để đưa ra quyết định cảnh báo.
    - Không chỉ dựa vào lượng mưa, hệ thống còn xét đến độ bão hòa của đất (Soil Moisture), khoảng cách đến sông và địa hình để phân loại chính xác Lũ quét (Flash Flood) hay Ngập úng (Inundation).

---

## 2. Công nghệ Sử dụng 🛠️

- **Runtime:** Python 3.9+
- **Geospatial Libraries:**
    - `psycopg2`: Tương tác trực tiếp với PostGIS để thực hiện các truy vấn không gian phức tạp (`ST_Contains`, `ST_Distance`).
- **Network Resilience:** Sử dụng `requests` với cơ chế Retry/Backoff để đảm bảo hoạt động ổn định ngay cả khi mạng chập chờn hoặc API bên thứ 3 bị gián đoạn.
- **Architecture:** Worker Pattern (Chạy ngầm liên tục theo chu kỳ).

---

## 3. Cấu trúc Dự án 📁

Dự án được chia thành các module chuyên biệt:

```text
ingestion-analysis-service/
|
├── config/           # Cấu hình ngưỡng cảnh báo (Thresholds)
├── etl                   # Các script chạy 1 lần (Setup)
│   ├── etl_import_zones.py         # Nạp biên giới hành chính
│   ├── etl_import_shelters.py      # Quét các điểm cứu trợ
│   ├── etl_import_waterways.py     # Tìm các sông ngòi xung quanh
│   ├── etl_import_stations.py      # Nạp các trạm đo mưa trên thành phố
│   ├── etl_station_profiling.py    # Nạp các tiêu chí đánh giá thiên tai tĩnh
│   └── etl_real_history.py         # Khôi phục lịch sử quá khứ
├── logic/
│   └── risk_analysis.py        # Thuật toán so sánh và ra quyết định
├── services/         # Các module kết nối bên ngoài
│   ├── weather_service.py      # Lấy dữ liệu mưa
│   ├── environment_service.py  # Lấy độ ẩm đất
│   ├── geo_service.py          # Tra cứu không gian PostGIS
│   └── orion_service.py        # Đẩy dữ liệu sang Orion
├── .env                  # Biến môi trường
├── Dockerfile            # Cấu hình Docker
├── main.py           # Vòng lặp chính (Main Loop)
└── requirements.txt      # Thư viện Python
```
