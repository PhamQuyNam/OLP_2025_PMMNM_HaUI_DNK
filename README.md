<!--
  Copyright 2025 HaUI.DNK
  Licensed under the Apache License, Version 2.0
  http://www.apache.org/licenses/LICENSE-2.0
-->

# VIET-RESILIENCE-HUB HỆ THỐNG NỀN TẢNG DỮ LIỆU MỞ GIÚP CẢNH BÁO SỚM VÀ PHẢN ỨNG KHẨN CẤP THIÊN TAI (Bài dự thi OLP PMNM 2025)

**Đội:** HaUI-DNK

**Trường:** Trường Công Nghệ Thông Tin và Truyền Thông (SICT) - Đại Học Công Nghiệp Hà Nội

<!-- [![Documentation](https://img.shields.io/badge/Documentation-View_Site-blue?style=for-the-badge)](https://github.com/PhamQuyNam/OLP_2025_PMMNM_HaUI_DNK.git) -->
[![License](https://img.shields.io/badge/License-Apache_2.0-yellow.svg?style=for-the-badge)](./LICENSE)

Bài dự thi Phát triển ứng dụng thành phố thông minh dựa trên nền tảng dữ liệu mở.

## 💡 Ý tưởng Cốt lõi: 

Hệ thống của chúng tôi là một giải pháp tiên phong nhằm chuyển đổi mô hình quản lý thiên tai tại Việt Nam từ phản ứng thụ động sang **dự báo chủ động** và **phản ứng phối hợp hai chiều**. Ý tưởng cốt lõi là thiết lập một nền tảng **Dữ liệu Mở (Open Context Data Platform)** sử dụng chuẩn **NGSI-LD** để quản lý trạng thái **thời gian thực** của các Thực thể liên quan đến nguy cơ thiên tai. Hệ thống không chỉ tích hợp các **tiêu chí dự đoán** khoa học (như Độ dốc , Lượng mưa tích lũy , Độ ẩm đất), mà còn tạo ra **kênh tương tác hai chiều** giữa các nhà quản lý với người dân. Nhà quản lý có được **Bản đồ Tình huống Chung** để ra quyết định , trong khi người dân có thể gửi các **Báo cáo sự cố** hoặc **tín hiệu Cầu cứu (SOS)** tức thời , tạo ra nguồn dữ liệu **NGSI-LD:CitizenReport** để hỗ trợ công tác cứu hộ. Toàn bộ hệ thống được xây dựng bằng công nghệ nguồn mở, đảm bảo tính khả chuyển và khả năng tái sử dụng cao.

## 🏗️ Kiến trúc Hệ thống

Đây là sơ đồ mô tả luồng dữ liệu chính, từ người dùng đến lớp dữ liệu lõi và ngược lại.

```mermaid
flowchart TD

%% ===== MICRO SERVICES & HẠ TẦNG =====
subgraph Services["Các Microservice & Hạ tầng"]
    direction LR
    API_GW((API Gateway - Nginx))
    AUTH[Auth Service]
    INGEST[Ingestion Service - Python]
    ALERT[Alert Service]
    REPORT[Report Service]
    SAFETY[Safety Service]
    WEATHER[Weather Service]
    DATA[Data Service]
end

%% ===== STORAGE =====
subgraph Storage["Dữ liệu Lõi"]
    ORION[(Orion-LD - Context Broker)]
    POSTGIS[(PostGIS - Du lieu Tinh Lich su)]
    MONGO[(MongoDB - Context Storage)]
end

%% ===== CLIENT =====
subgraph Clients["Giao diện Người dùng"]
    FE["CITIZEN, ADMIN"]
end

%% ===== KẾT NỐI CƠ BẢN =====
AUTH --> POSTGIS
INGEST -- Query Tinh & ETL --> POSTGIS
ALERT --> POSTGIS
SAFETY --> POSTGIS
DATA --> POSTGIS
ORION -- Luu Context Hien tai --> MONGO

%% ===== LUỒNG 1: CẢNH BÁO CHỦ ĐỘNG =====
subgraph Flow1["1. Canh bao Chu dong - Analysis & Workflow"]
    direction LR

    APIs["Du lieu Mua - Moi truong"] -->|Thu thap & Phan tich| INGEST
    INGEST -->|Cap nhat RainObserved| ORION
    INGEST -->|Internal API| ALERT

    ALERT -->|Save status PENDING| POSTGIS
    FE -->|Quan ly - Duyet| ALERT

    ALERT -->|APPROVED| ORION
    ALERT -->|Socket.IO| API_GW
    API_GW -->|Proxy WS| FE
end

%% ===== LUỒNG 2: SOS & CROWDSOURCING =====
subgraph Flow2["2. Phan anh & SOS"]
    direction LR

    FE -->|/reports/send| REPORT
    REPORT -->|Create CitizenReport| ORION

    FE -->|/safety/sos| SAFETY
    SAFETY -->|Find nearest Safe Zone| POSTGIS
    SAFETY -->|Evacuation guidance| FE

    FE -->|Manager query SOS| SAFETY
end

%% ===== LUỒNG 3: TRUY VẤN HIỂN THỊ =====
subgraph Flow3["3. Truy van & Hien thi"]
    direction LR

    FE --> API_GW

    API_GW --> WEATHER
    WEATHER -->|Query RainObserved| ORION

    API_GW --> DATA
    DATA -->|Query RiskZones - Waterways| POSTGIS

    API_GW --> REPORT
    REPORT -->|Query CitizenReport| ORION
end

```
## 🛠️ Công nghệ & Phụ thuộc (Tech Stack)

Nền tảng này sử dụng và tích hợp các PMMN sau:

- **Nền tảng Dữ liệu Đô thị Mở:**	FIWARE Orion-LD Context Broker  
- **Mô hình hóa Dữ liệu:** Sử dụng tiêu chuẩn SOSA/SSN (W3C)
- **Lưu Trữ Dữ liệu (GIS/Relational):**  PostgreSQL (Kèm theo tiện ích mở rộng PostGIS)
- **Lưu Trữ Lịch sử (Historian):** FIWARE QuantumLeap (với Mongodb )  
- **Lưu Trữ Media/Object:** MinIO
- **Backend API Gateway:** Node.js (Express)
- **Ingestion Service:** Python (Scikit-learn, Pandas)
- **Frontend/Giao diện:** React.js  
- **Bản Đồ Số:** Leaflet.js  
- **Đóng gói/Triển khai:** Docker và Docker Compose

## 🚀 Hướng dẫn Cài đặt

Hệ thống yêu cầu đã cài đặt Docker và Docker Compose.

**Clone kho mã nguồn:**
```bash
git clone https://github.com/PhamQuyNam/OLP_2025_PMMNM_HaUI_DNK.git
```

**Thiết lập biến môi trường (.env)**

Để chạy dự án, bạn cần cấu hình file `.env` cho **từng service** gồm:

- `alert-service`
- `auth-service`
- `data-service`
- Thư mục gốc của dự án

**Các bước thực hiện**

1. Sao chép file mẫu `.env.example` để tạo file `.env`:

```bash
cp .env.example .env
```
2. Cấu hình file `.env`;

Sau khi tạo file `.env`, mở file và cập nhật các thông số cấu hình cần thiết (theo tùy file), bao gồm:

- Mật khẩu database
- Thông tin kết nối server (host, port, protocol, v.v.)
- Các biến bảo mật như `JWT_SECRET`, `API_KEY`, `CLIENT_SECRET`, …

Sau khi chỉnh sửa, **lưu lại file `.env`** để áp dụng cấu hình.

3. Lưu ý bảo mật

> ⚠️ **Quan trọng:**  
> Không commit file `.env` lên repository để tránh làm lộ thông tin nhạy cảm (mật khẩu, API key, secret key, …).  
> Hãy đảm bảo file `.env` đã được liệt kê trong `.gitignore`.


**Chạy ứng dụng**  
(Mở terminal trong thư mục gốc và chạy lệnh)
```bash
docker-compose up -d --build  
```

## 🌐 Xem Giao diện Web (Ví dụ)

- **Dashboard Nhà Quản lý:** http://localhost:3001/manager   
- **Ứng dụng Người Dân:** http://localhost:3001/citizen   
- **API Backend (Node.js):** http://localhost:8000/api/...
- **API Cảnh báo/Báo cáo:** http://localhost:3004/api/...
- **Orion-LD Context Broker:** http://localhost:1026/ngsi-ld/v1/entities  

**Dừng hệ thống:**
```bash
docker-compose stop
```
**Dọn dẹp hoàn toàn (Xóa container, network, và volumes):**
```bash
docker-compose down -v
```


## 🤝 Đóng góp cho Dự án

* **Báo lỗi ⚠️:** [Tạo một Bug Report](https://github.com/PhamQuyNam/OLP_2025_PMMNM_HaUI_DNK/issues/new?assignees=&labels=bug&template=bug_report.md&title=[BUG])
* **Yêu cầu tính năng 👩‍💻:** [Đề xuất một tính năng mới](https://github.com/PhamQuyNam/OLP_2025_PMMNM_HaUI_DNK/issues/new?assignees=&labels=enhancement&template=feature_request.md&title=[FEAT])

Nếu bạn muốn đóng góp cho dự án, hãy đọc `CONTRIBUTING.md` để biết thêm chi tiết.
Mọi đóng góp của các bạn đều được trân trọng, đừng ngần ngại gửi pull request cho dự án.

---

## 📞 Liên hệ

* **Phạm Quý Nam:** phamquynam2004@gmail.com
* **Trịnh Gia Luật:** luattrinh2k4@gmail.com
* **Ngô Văn Tấn:** ngovantannvt04@gmail.com

---
## ⚖️ Giấy phép

Dự án này được cấp phép theo Giấy phép **Apache 2.0**. Xem chi tiết tại file [LICENSE](./LICENSE).