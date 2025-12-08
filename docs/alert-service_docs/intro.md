<!--
  Copyright 2025 HaUI.DNK
  Licensed under the Apache License, Version 2.0
  http://www.apache.org/licenses/LICENSE-2.0
-->
---
sidebar_position: 5
title: Alert Service (Quản lý Quy trình Cảnh báo)
---

**Alert Service** là microservice chịu trách nhiệm quản lý toàn bộ vòng đời của một sự kiện cảnh báo thiên tai. Nó đóng vai trò là trung tâm điều phối (Workflow Engine), đảm bảo tính chính xác và tin cậy của thông tin trước khi phát đi cho công chúng.

---

## 1. Mục tiêu & Chức năng 🎯

Mục tiêu chính của Alert Service là thực hiện quy trình **"Human-in-the-loop"** (Con người tham gia kiểm soát):

- **Tiếp nhận & Sàng lọc (De-duplication):**
    - Nhận tín hiệu từ *Analysis Service*.
    - Tự động phát hiện và gộp các cảnh báo trùng lặp (ví dụ: mưa kéo dài 2 tiếng chỉ tạo 1 bản ghi).
    - Lưu vào bảng **"Nóng" (Active Alerts)** ở trạng thái `PENDING`.
- **Quy trình Phê duyệt (Workflow):**
    - Cung cấp API cho Cán bộ quản lý (Manager) xem danh sách chờ duyệt.
    - Xử lý hành động **Duyệt (Approve)** hoặc **Từ chối (Reject)**.
- **Phát hành & Lưu trữ:**
    - Khi được duyệt: Chuyển dữ liệu sang bảng **"Lạnh" (Archive)** để lưu trữ vĩnh viễn.
    - Đẩy thông tin lên **Orion Context Broker** để hiển thị lên bản đồ thời gian thực.
    
---

## 2. Công nghệ Sử dụng 🛠️

- **Runtime:** Node.js (v18+)
- **Framework:** Express.js
- **Database:** PostgreSQL (PostGIS) - Quản lý 2 bảng `active_alerts` và `alert_archive`.
- **Inter-service Communication:** `axios` (Gọi sang Orion).

---

## 3. Cấu trúc Dự án 📁

```text
alert-service/
├── src/
│   ├── config/           # Cấu hình DB, Swagger
│   ├── controllers/      # Logic nghiệp vụ (Workflow, De-duplication)
│   ├── models/           # Schema định nghĩa bảng Active/Archive
│   ├── routes/           # Định nghĩa API
│   └── index.js          # Entry Point
├── .env                  # Biến môi trường
├── Dockerfile            # Cấu hình Docker
└── package.json          # Thư viện phụ thuộc
```

## 4. Mô hình Dữ liệu (Data Lifecycle) 🔄
Service này quản lý sự di chuyển của dữ liệu qua 2 giai đoạn:

1. Giai đoạn Chờ (Pending): Dữ liệu nằm ở bảng active_alerts. Tồn tại ngắn hạn.

2. Giai đoạn Chốt (Approved): Dữ liệu được di chuyển sang bảng alert_archive. Tồn tại vĩnh viễn.

## 5. Cài đặt & Chạy Service 🚀

### Chạy bằng Docker (Khuyên dùng)

```bash
# Tại thư mục gốc dự án
docker-compose up -d --build alert-service
```

### Chạy Local (Dev)
1. Cài đặt: npm install

2. Cấu hình: Tạo .env (PORT=3005, DB Config...).

3. Chạy: npm start

   - Service hoạt động tại: http://localhost:3005
   
## 6. Tài liệu API (Swagger) 📚
Truy cập qua Gateway: http://localhost:8000/docs/ -> Chọn "5. Alert Service".

### Các Endpoint chính:

| Method | Endpoint                          | Đối tượng | Mô tả                                                   |
|--------|-----------------------------------|-----------|---------------------------------------------------------|
| POST   | `/api/alerts/internal/receive`    | System    | Nhận cảnh báo thô từ Analysis Service.                 |
| GET    | `/api/alerts/pending`             | Manager   | Xem danh sách cảnh báo đang chờ duyệt.                 |
| PATCH  | `/api/alerts/{id}/review`         | Manager   | Duyệt (APPROVED) hoặc Hủy (REJECTED).                  |
| GET    | `/api/alerts`                     | Public    | Lấy danh sách cảnh báo đã duyệt (trong 24h qua).       |
