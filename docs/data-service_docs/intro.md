---
sidebar_position: 7
title: Data Service (Dữ liệu Nền & Thống kê)
---

**Data Service** là microservice đóng vai trò "xương sống" dữ liệu của hệ thống. Nhiệm vụ chính của nó là cung cấp các dữ liệu nền (Base Map Data) phục vụ hiển thị bản đồ và dữ liệu lịch sử (Historical Data) phục vụ cho các trang thống kê, báo cáo.

---

## 1. Mục tiêu & Chức năng 🎯

Mục tiêu chính của Data Service bao gồm:

- **Cung cấp Dữ liệu Không gian (GIS Provider):**
    - Trả về dữ liệu bản đồ dưới chuẩn GeoJSON để Frontend (Leaflet/Mapbox) vẽ các lớp phủ (Layers).
- **Truy xuất Lịch sử & Thống kê (Analytics):**
    - Tính toán các chỉ số thống kê tổng hợp (Aggregation) để vẽ biểu đồ Dashboard.
- **Lưu trữ Dữ liệu Môi trường (Environmental Metrics):**
    - Quản lý các chỉ số tĩnh đã được làm giàu (Enriched Data) như: Độ dốc, Tỷ lệ bê tông hóa, Mật độ thoát nước... giúp minh bạch hóa cơ sở ra quyết định của hệ thống.

---

## 2. Công nghệ Sử dụng 🛠️

- **Runtime:** Node.js (v18+)
- **Framework:** Express.js
- **Database:** PostgreSQL (với Extension PostGIS mạnh mẽ để xử lý dữ liệu hình học).
- **Driver:** `pg` (node-postgres) để thực thi các câu truy vấn SQL thuần và Geo-Spatial Queries.

---

## 3. Cấu trúc Dự án 📁

```text
data-service/
├── src/
│   ├── config/           # Cấu hình DB
│   ├── controllers/      # Logic truy vấn Map và History
│   ├── models/           # Schema định nghĩa bảng (RiskZones, History...)
│   └── routes/           # Định nghĩa API (/map, /history)
├── .env                  # Biến môi trường
├── Dockerfile            # Cấu hình Docker
├── package.json          # Thư viện phụ thuộc
└── server.js             # Entry Point (Port 3002)
```

## 4. Mô hình Dữ liệu (Data Schema) 🗄️

## 5. Cài đặt & Chạy Service 🚀

### Chạy bằng Docker (Khuyên dùng)

```bash
# Tại thư mục gốc dự án
docker-compose up -d --build data-service
```

### Chạy Local (Dev)
1. Cài đặt: npm install

2. Cấu hình: Tạo .env (PORT=3002, DB Config...).

3. Chạy: npm start

   - Service hoạt động tại: http://localhost:3002
   
## 6. Tài liệu API (Swagger) 📚

Truy cập qua Gateway: http://localhost:8000/docs/ -> Chọn "2. Data Service".

### Các Endpoint chính:

| Method | Endpoint         | Mô tả                         | Định dạng                   |
|--------|------------------|------------------------------|-----------------------------|
| GET    | `/api/map/zones` | Lấy danh sách vùng nguy cơ.  | GeoJSON FeatureCollection  |
| GET    | `/api/map/points`| Lấy danh sách điểm xung yếu. | GeoJSON FeatureCollection  |