<!--
  Copyright 2025 HaUI.DNK
  Licensed under the Apache License, Version 2.0
  http://www.apache.org/licenses/LICENSE-2.0
-->
---
sidebar_position: 4
title: Report Service (Quản lý Báo cáo & Phản ánh)
---

**Report Service** là microservice chịu trách nhiệm thu thập và quản lý các báo cáo sự cố (Citizen Reports) từ cộng đồng. Đây là kênh tương tác hai chiều quan trọng, cho phép người dân đóng góp dữ liệu hiện trường (Crowdsourcing) để hỗ trợ công tác quản lý và cứu hộ.

---

## 1. Mục tiêu & Chức năng 🎯

Mục tiêu chính của Report Service bao gồm:

- **Tiếp nhận Báo cáo Sự cố:** Cung cấp API cho phép người dân gửi thông tin về thiên tai (ngập lụt, sạt lở) kèm theo tọa độ GPS chính xác và mô tả hiện trạng.
- **Định danh & Chuẩn hóa:**
    - Tự động sinh mã định danh duy nhất (UUID) cho mỗi báo cáo theo chuẩn URN của NGSI-LD (ví dụ: `urn:ngsi-ld:CitizenReport:...`).
    - Chuyển đổi dữ liệu thô từ người dùng thành cấu trúc thực thể (Entity) chuẩn để tương thích với Orion Context Broker.
- **Quản lý Vòng đời Báo cáo:** Hỗ trợ các thao tác Xem danh sách (cho Dashboard quản lý) và Xóa báo cáo (khi có sai sót hoặc vi phạm).

---

## 2. Công nghệ Sử dụng 🛠️

- **Runtime:** Node.js (v18+)
- **Framework:** Express.js
- **Libraries:**
    - `axios`: Giao tiếp với Orion Context Broker.
    - `uuid`: Sinh khóa chính duy nhất.
- **Data Source:** Dữ liệu được lưu trữ và truy vấn trực tiếp từ **Fiware Orion**.

---

## 3. Cấu trúc Dự án 📁

```text
report-service/
├── src/
│   ├── config/           # Cấu hình Swagger
│   ├── controllers/      # Logic nghiệp vụ (Format NGSI-LD, Call Orion)
│   ├── routes/           # Định nghĩa API (GET, POST, DELETE)
│   └── index.js          # Entry Point (Port 3004)
├── .env                  # Biến môi trường
├── Dockerfile            # Cấu hình Docker
└── package.json          # Thư viện phụ thuộc
```

## 4. Luồng Xử lý Dữ liệu (Data Flow) 🔄
Quy trình khi một người dân gửi báo cáo:

1. Input: Người dùng gửi JSON chứa { type, description, lat, lon, phone }.

2. Processing:

    - Tạo ID: urn:ngsi-ld:CitizenReport:{uuid}.
    - Tạo Timestamp: Thời gian hiện tại.
    - Đóng gói thành GeoJSON Point cho thuộc tính location.

3. Storage: Gửi yêu cầu POST sang Orion Context Broker để lưu thực thể.

4. Output: Trả về mã thành công 201 Created cho Frontend.

## 5. Cài đặt & Chạy Service 🚀

### Chạy bằng Docker (Khuyên dùng)

```bash
# Tại thư mục gốc dự án
docker-compose up -d --build report-service
```

### Chạy Local (Dev)
1. Cài đặt: npm install

2. Cấu hình: Tạo .env (PORT=3004, ORION_HOST=http://localhost:1026).

3. Chạy: npm start

   - Service hoạt động tại: http://localhost:3004
   
## 6. Tài liệu API (Swagger) 📚
Truy cập qua Gateway: http://localhost:8000/docs/ -> Chọn "4. Report Service".

### Các Endpoint chính:

| Method | Endpoint               | Đối tượng | Mô tả                                                   |
|--------|------------------------|-----------|---------------------------------------------------------|
| POST   | `/api/reports/send`    | Người dân | Gửi báo cáo sự cố mới kèm tọa độ.                 |
| GET    | `/api/reports/receive` | Manager   | Lấy danh sách tất cả báo cáo để hiển thị lên bản đồ quản lý.|
| GET    | `/api/reports/{id}`    | Manager   | Xóa một báo cáo khỏi hệ thống (Dựa trên ID).|

### Ví dụ Payload gửi đi:

```json
{
  "type": "FLOOD",
  "description": "Nước dâng cao ngập xe máy",
  "lat": 18.3436,
  "lon": 105.9002,
  "phone": "0912345678"
}
```