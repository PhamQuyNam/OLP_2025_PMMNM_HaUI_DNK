---
sidebar_position: 1
title: API Gateway (Cổng Giao Tiếp)
---

**API Gateway** là thành phần quan trọng nhất trong kiến trúc Microservices của **Viet-Resilience Hub**. Nó đóng vai trò là "Cổng chính duy nhất" (Single Entry Point), tiếp nhận mọi yêu cầu từ phía người dùng (Frontend Web/Mobile) và điều phối chúng đến đúng các dịch vụ con bên trong hệ thống.

---

## 1. Mục tiêu & Chức năng 🎯

Mục tiêu chính của API Gateway bao gồm:

- **Thống nhất Đầu mối:** Client chỉ cần biết một địa chỉ duy nhất (`http://localhost:8000`) thay vì phải nhớ hàng tá cổng (`3001`, `3002`, `1026`...).
- **Định tuyến Thông minh (Routing):** Dựa vào đường dẫn (URL Path) để chuyển yêu cầu đến đúng Service xử lý (Ví dụ: `/api/auth` về Auth Service, `/api/weather` về Weather Service).
- **Xử lý Bảo mật & CORS:**
    - Cấu hình **CORS** (Cross-Origin Resource Sharing) tập trung tại một nơi, giải quyết triệt để lỗi chặn truy cập từ trình duyệt.
    - Ẩn giấu kiến trúc hạ tầng bên trong (Internal Network) khỏi Internet công cộng.
- **Cân bằng tải** (Load Balancing): Có khả năng phân phối tải nếu sau này triển khai nhiều bản sao (replicas) của cùng một service.

---

## 2. Công nghệ Sử dụng 🛠️

- **Core:** **NGINX** (Phiên bản Alpine siêu nhẹ) - Web Server hiệu năng cao được sử dụng làm Reverse Proxy.
- **Containerization:** Docker.

---

## 3. Cấu trúc Dự án 📁

Cấu trúc của Gateway rất gọn nhẹ, tập trung hoàn toàn vào file cấu hình.

```text
api-gateway/
├── nginx.conf        # "Bộ não" của Gateway: Chứa quy tắc định tuyến & CORS
└── Dockerfile        # Cấu hình đóng gói Image Nginx tùy chỉnh
```
## 4. Bảng Quy hoạch Định tuyến (Routing Table) 🗺️

Dưới đây là bản đồ quy hoạch các đường dẫn API trong hệ thống:

| Đường dẫn (Public URL) | Chuyển đến Service (Internal) | Mô tả Chức năng |
|------------------------|--------------------------------|------------------|
| `/api/auth/`           | `auth-service:3001`            | Đăng ký, Đăng nhập, Quản lý Token. |
| `/api/map/`            | `data-service:3002`            | Các dữ liệu nền khác (Bản đồ vùng, Lịch sử thống kê). |
| `/api/weather/`        | `weather-service:3003`         | Lấy dữ liệu thời tiết thời gian thực (Mưa, Nhiệt độ). |
| `/api/reports/`        | `report-service:3004`          | Gửi và xem báo cáo sự cố từ cộng đồng. |
| `/api/alerts/`         | `alert-service:3005`           | Quản lý quy trình duyệt và phát cảnh báo thiên tai. |
| `/api/safety/`         | `safety-service:3006`          | Xử lý tín hiệu SOS và tìm điểm cứu trợ gần nhất. |
| `/orion/`              | `orion:1026`                   | Truy cập trực tiếp Context Broker (NGSI-LD). |
| `/docs/`               | `swagger-ui:8080`              | Giao diện tài liệu API tập trung. |

## 5. Cài đặt & Chạy Service 🚀

### Yêu cầu tiên quyết

- **Docker & Docker Compose**: Gateway là một phần không thể tách rời của mạng lưới Docker.
---

### Khởi chạy

Gateway thường được khởi động cùng lúc với toàn bộ hệ thống.

```bash
# Tại thư mục gốc của dự án
docker-compose up -d --build gateway
```
Sau khi khởi động thành công, Gateway sẽ lắng nghe tại cổng 8000 trên máy chủ của bạn (http://localhost:8000).

## 6. Lưu ý Quan trọng cho Developer ⚠️

### 🔸 Cấu hình CORS
Nếu Frontend gặp lỗi CORS, hãy kiểm tra phần:

- `add_header 'Access-Control-Allow-Origin' '*'` trong file nginx.conf
-  Đảm bảo đã cấu hình đầy đủ các header:  
  `Access-Control-Allow-Methods`, `Access-Control-Allow-Headers`, `Access-Control-Allow-Credentials`

---

### 🔸 Thêm Service Mới vào hệ thống

Mỗi khi bạn tạo Microservice mới, bạn bắt buộc phải thực hiện:

1. Thêm upstream mới trong `nginx.conf`

   ```nginx
   upstream ten-service {
       server ten-service:3000;
   }
   ```
2. Thêm block định tuyến

   ```nginx
   location /api/ten-service/ {
    proxy_pass http://ten-service/;
   }   
   ```
3. Restart API Gateway để áp dụng cấu hình
   ```bash
   docker-compose restart gateway
   ```
