---
sidebar_position: 6
title: Safety Service (Cứu hộ & Khẩn cấp)
---

**Safety Service** là microservice chuyên trách xử lý các tình huống khẩn cấp (Emergency). Nó được thiết kế để hoạt động như một hệ thống phản ứng nhanh, cung cấp chỉ dẫn thoát hiểm cho người dân ngay lập tức khi họ gặp nạn, đồng thời cung cấp thông tin định vị cho đội cứu hộ.

---

## 1. Mục tiêu & Chức năng 🎯

Mục tiêu chính của Safety Service bao gồm:

- **Xử lý Tín hiệu SOS (Panic Mode):** Tiếp nhận yêu cầu cầu cứu chỉ với "Một nút bấm". Hệ thống ghi nhận vị trí GPS, số điện thoại và lời nhắn khẩn cấp của nạn nhân.
- **Chỉ dẫn Thoát hiểm Tức thì (Instant Guidance):**
    - Ngay khi nhận được tín hiệu SOS, service sẽ tự động tính toán và trả về danh sách các Điểm an toàn (Safe Zones) gần nhất (Bệnh viện, Trường học, Đồn công an...) trong bán kính 10km.
    - Giúp người dân biết ngay cần chạy đi đâu để sống sót mà không cần chờ người cứu.
- **Hỗ trợ Tác chiến (War Room):** Cung cấp API cho Dashboard của Quản lý để hiển thị vị trí các nạn nhân đang chờ cứu (Active SOS) trên bản đồ theo thời gian thực.

---

## 2. Công nghệ Sử dụng 🛠️

- **Runtime:** Node.js (v18+)
- **Framework:** Express.js
- **Database:** PostgreSQL (PostGIS) - Sử dụng các hàm không gian (`ST_Distance`, `ST_DWithin`, `KNN`) để tìm kiếm địa điểm gần nhất.
- **Data Source:** Dữ liệu điểm an toàn được ETL từ OpenStreetMap (Bệnh viện, Trường học, Cơ quan công quyền).

---

## 3. Cấu trúc Dự án 📁

```text
safety-service/
├── src/
│   ├── config/           # Cấu hình Swagger, DB
│   ├── controllers/      # Logic xử lý SOS và tìm kiếm không gian
│   ├── models/           # Schema bảng sos_signals và safe_zones
│   ├── routes/           # Định nghĩa API
│   └── index.js          # Entry Point (Port 3006)
├── .env                  # Biến môi trường
├── Dockerfile            # Cấu hình Docker
└── package.json          # Thư viện phụ thuộc
```

## 4. Luồng Xử lý "2 trong 1" (Request-Response) 🔄

Để tối ưu thời gian trong tình huống sinh tử, API SOS thực hiện 2 nhiệm vụ trong 1 lần gọi:

1. Input (Người dân gửi): Tọa độ GPS (lat, lon), SĐT, Lời nhắn.

2. Processing:

   - Lưu tín hiệu vào bảng sos_signals (Trạng thái: ACTIVE).
   
   - Query PostGIS tìm 5 điểm safe_zones gần nhất.

3. Output (Hệ thống trả về): Danh sách điểm an toàn kèm khoảng cách. Frontend sẽ dùng dữ liệu này để vẽ đường đi ngay lập tức.

## 5. Cài đặt & Chạy Service 🚀

### Chạy bằng Docker (Khuyên dùng)

```bash
# Tại thư mục gốc dự án
docker-compose up -d --build safety-service
```

### Chạy Local (Dev)
1. Cài đặt: npm install

2. Cấu hình: Tạo .env (PORT=3006, DB Config...).

3. Chạy: npm start

   - Service hoạt động tại: http://localhost:3006
   
## 6. Tài liệu API (Swagger) 📚

Truy cập qua Gateway: http://localhost:8000/docs/ -> Chọn "6. Safety Service".

### Các Endpoint chính:

| Method | Endpoint                       | Đối tượng | Mô tả                                                              |
|--------|--------------------------------|-----------|--------------------------------------------------------------------|
| POST   | `/api/safety/sos`              | Người dân | Gửi tín hiệu SOS và nhận lại danh sách điểm an toàn.               |
| GET    | `/api/safety/sos/active`       | Manager   | Lấy danh sách các nạn nhân đang chờ cứu (để hiện chấm đỏ trên bản đồ). |
| PATCH  | `/api/safety/sos/{id}/resolve` | Manager   | Xác nhận đã cứu hộ thành công (Đổi trạng thái sang RESCUED).       |

