---
sidebar_position: 3
title: Weather Service (Thời tiết Thời gian thực)
---

**Weather Realtime Service** là microservice chuyên trách việc cung cấp dữ liệu quan trắc (lượng mưa, mực nước) theo thời gian thực cho các ứng dụng người dùng. Nó đóng vai trò là lớp đệm thông minh giữa Frontend và Context Broker, giúp giảm tải cho hệ thống lõi và chuẩn hóa dữ liệu hiển thị.

---

## 1. Mục tiêu & Chức năng 🎯

Mục tiêu chính của Weather Service bao gồm:

- **Phân phối Dữ liệu Thời gian thực (Real-time Delivery):** Cung cấp API tốc độ cao để Frontend (Web/Mobile) có thể liên tục cập nhật trạng thái (Polling) mà không làm ảnh hưởng đến các service nghiệp vụ khác.
- **Chuẩn hóa Dữ liệu Hiển thị (Data Formatting):**
    - Chuyển đổi dữ liệu thô phức tạp từ chuẩn NGSI-LD (của Orion) sang định dạng JSON đơn giản, dễ dùng.
    - Tự động tính toán trạng thái hiển thị (SAFE, WARNING, DANGER) và mã màu (GREEN, RED) dựa trên lượng mưa hiện tại, giúp Frontend chỉ việc vẽ mà không cần xử lý logic.
- **Tách biệt Hạ tầng:** Giúp ẩn giấu cấu trúc và địa chỉ thật của Orion Context Broker khỏi người dùng cuối.

---

## 2. Công nghệ Sử dụng 🛠️

- **Runtime:** Node.js (v18+)
- **Framework:** Express.js
- **Data Source:** Fiware Orion Context Broker (HTTP API)
- **Library:** `axios` (HTTP Client)

---

## 3. Cấu trúc Dự án 📁

Service này có cấu trúc rất gọn nhẹ, tập trung vào tốc độ xử lý.

```text
weather-realtime-service/
├── src/
│   ├── config/           # Cấu hình Swagger
│   ├── controllers/      # Logic gọi Orion và format dữ liệu
│   ├── routes/           # Định nghĩa Endpoint
│   └── index.js          # Entry Point (Port 3003)
├── .env                  # Biến môi trường
├── Dockerfile            # Cấu hình Docker
└── package.json          # Thư viện phụ thuộc
```

## 4. Mô hình Xử lý Dữ liệu 🔄
Quy trình xử lý một yêu cầu lấy dữ liệu thời tiết:

1. Request: Frontend gọi API.

2. Fetch: Service gọi sang Orion lấy toàn bộ thực thể RainObserved.

3. Process:

    - Lấy rainVolume.

    - So sánh với ngưỡng (ví dụ: > 50mm là Nguy hiểm).

    - Gán nhãn status và displayColor.

4. Response: Trả về mảng JSON tinh gọn cho Frontend.

## 5. Cài đặt & Chạy Service 🚀

### Chạy bằng Docker (Khuyên dùng)

```bash
# Tại thư mục gốc dự án
docker-compose up -d --build weather-realtime-service
```

### Chạy Local (Dev)
1. Cài đặt: npm install

2. Cấu hình: Tạo .env (PORT=3003, ORION_HOST=http://localhost:1026, DB Config...).

3. Chạy: npm start

   - Service hoạt động tại: http://localhost:3003

## 6. Tài liệu API (Swagger) 📚

Truy cập qua Gateway: http://localhost:8000/docs/ -> Chọn "3. Weather Service".

### Các Endpoint chính:

| Method | Endpoint                | Đối tượng | Mô tả                                                   |
|--------|-------------------------|-----------|---------------------------------------------------------|
| GET    | `/api/weather/realtime` | System    | Lấy danh sách tất cả các trạm quan trắc kèm trạng thái màu sắc.|

### Ví dụ dữ liệu trả về:

```json
[
  {
    "id": "urn:ngsi-ld:RainObserved:Station_01",
    "name": "Trạm Hương Sơn",
    "rain": 45.5,
    "lat": 18.45,
    "lon": 105.34,
    "status": "DANGER",
    "displayColor": "RED",
    "message": "Đang mưa 45.5mm"
  }
]
```