---
sidebar_position: 2
title: Auth Service (Quản lý Định danh)
---

**Auth Service** là microservice chịu trách nhiệm quản lý danh tính, xác thực và phân quyền người dùng trong hệ thống **Viet-Resilience Hub**. Dịch vụ này đóng vai trò là "người gác cổng", đảm bảo chỉ những người dùng hợp lệ mới có thể truy cập tài nguyên và nhận cảnh báo.

---

## 1. Mục tiêu & Chức năng 🎯

Mục tiêu chính của Auth Service bao gồm:

- **Quản lý Vòng đời Người dùng:** Xử lý Đăng ký (Register), Đăng nhập (Login), Đăng xuất (Logout) cho cả Người dân (Citizen) và Quản lý (Manager).
- **Bảo mật & Xác thực:**
    - Sử dụng JWT (JSON Web Token) để cấp phát và xác thực phiên làm việc.
    - Mã hóa mật khẩu an toàn bằng Bcrypt.
- **Lưu trữ Thông tin Địa lý (GIS):**
    - Lưu trữ tọa độ (Lat/Lon) của người dân vào PostGIS.
- **Phân quyền (Authorization):** Phân biệt quyền hạn giữa người dân thường và cán bộ quản lý để truy cập các API nhạy cảm.

---

## 2. Công nghệ Sử dụng 🛠️

- **Runtime:** Node.js (v18+)
- **Framework:** Express.js
- **Database:** PostgreSQL (với Extension PostGIS)
- **Authentication:** `jsonwebtoken`, `bcryptjs`
- **Documentation:** Swagger UI (`swagger-jsdoc`)

---

## 3. Cấu trúc Dự án 📁

Mã nguồn được tổ chức theo mô hình MVC (Model-View-Controller) để dễ dàng mở rộng và bảo trì.

```text
auth-service/
├── src/
│   ├── config/           # Cấu hình kết nối DB, Swagger
│   ├── controllers/      # Logic nghiệp vụ (Auth, Internal User Search)
│   ├── middleware/       # Middleware xác thực (Verify Token)
│   ├── models/           # Định nghĩa Schema Database (Users, Refresh Tokens)
│   └── routes/           # Định nghĩa các Endpoint API
├── .env                  # Biến môi trường (Local)
├── Dockerfile            # Cấu hình đóng gói Container
├── package.json          # Quản lý thư viện phụ thuộc
└── server.js             # File khởi động (Entry Point)
```
# 4. Cài đặt & Chạy Auth Service 🚀

### Yêu cầu Tiên quyết

- **Node.js**: Phiên bản **18 trở lên**
- **Docker & Docker Compose**: Dùng khi chạy cùng hệ sinh thái Microservices (PostGIS, API Gateway)

---

### Cách 1: Chạy bằng Docker (Khuyên dùng)

Đây là cách chuẩn nhất để Auth Service kết nối đúng với các microservice khác.

```bash
# Tại thư mục gốc của dự án (Viet-Resilience-Hub)
docker-compose up -d --build auth-service
```
### Cách 2: Chạy Local (Để phát triển/Debug)

Nếu bạn muốn chạy riêng service này trên máy cá nhân:

### 🔹 Cài đặt thư viện

```bash
cd auth-service
npm install
```
### 🔹 Cấu hình môi trường
Tạo file .env trong thư mục auth-service và trỏ Database về localhost (thay vì postgis).

### 🔹 Khởi chạy:

```bash
npm start
```
Service sẽ hoạt động tại: http://localhost:3001

# 5. Tài liệu API (Swagger) 📚

Sau khi khởi động hệ thống, bạn có thể xem tài liệu chi tiết và test thử các API của Auth Service thông qua API Gateway:

- **URL**: http://localhost:8000/docs/
- **Chọn Service**: 1. Auth Service trong menu thả xuống.

Tại đây bạn có thể thử nghiệm các chức năng:

- **POST** /api/auth/register: Đăng ký tài khoản mới (kèm tọa độ hoặc không).
- **POST** /api/auth/login: Đăng nhập tài khoản và lấy Access Token.