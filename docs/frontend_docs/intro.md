---
sidebar_position: 1
title: Giới Thiệu Tổng Quan
---

**VIET-RESILIENCE-HUB** là nền tảng mã nguồn mở được thiết kế nhằm nâng cao năng lực cộng đồng trong việc ứng phó và phục hồi sau thiên tai tại Việt Nam.

Phần **Frontend** đóng vai trò là giao diện tương tác chính, giúp người dân, đội cứu hộ và các nhà quản lý tiếp cận thông tin rủi ro, điều phối nguồn lực và ra quyết định kịp thời dựa trên dữ liệu trực quan.

---

## 1. Mục tiêu & Phạm vi

Frontend của dự án được xây dựng với các tiêu chí cốt lõi:

- **Tính Nhân văn & Tiếp cận:** Giao diện UI/UX được thiết kế tối giản, trực quan, đảm bảo người dân ở mọi trình độ công nghệ đều có thể gửi yêu cầu cứu trợ hoặc xem cảnh báo dễ dàng.
- **Phản hồi Thời gian thực (Real-time):** Hiển thị tức thì các thông báo khẩn cấp và vị trí các điểm sạt lở/ngập lụt.
- **Trực quan hóa Dữ liệu (Data Viz):** Biến đổi các số liệu khí tượng thủy văn phức tạp thành các bản đồ, biểu đồ tương tác dễ hiểu.
- **Khả năng Mở rộng:** Kiến trúc Component được module hóa để cộng đồng lập trình viên có thể dễ dàng đóng góp tính năng mới (ví dụ: module quyên góp, module y tế).

## 2. Công nghệ sử dụng

Dự án sử dụng bộ công cụ Frontend hiện đại, tối ưu hóa hiệu suất và khả năng mở rộng, tập trung vào bản đồ số và giao tiếp thời gian thực.

### ⚛️ Core & Môi trường

| Công nghệ             | Phiên bản | Vai trò & Mô tả                                               |
| :-------------------- | :-------- | :------------------------------------------------------------ |
| **React / React DOM** | `v19.2.0` | Thư viện giao diện người dùng chính (UI Library).             |
| **Vite**              | `v7.2.4`  | Build tool thế hệ mới, tập trung vào tốc độ khởi động và HMR. |
| **React Router DOM**  | `v7.9.6`  | Quản lý định tuyến (Client-side routing) cho SPA.             |
| **ESLint**            | `v9.39.1` | Linter giúp đảm bảo chất lượng và quy chuẩn code.             |

### 🌐 Mạng & Quản lý Trạng thái

| Công nghệ            | Phiên bản | Vai trò & Mô tả                                                    |
| :------------------- | :-------- | :----------------------------------------------------------------- |
| **Axios**            | `v1.13.2` | HTTP Client xử lý các request tới Backend API.                     |
| **Socket.IO Client** | `v4.8.1`  | Giao tiếp thời gian thực (Real-time) cho tính năng SOS & Cảnh báo. |

### 🎨 UI & Styling

| Công nghệ                 | Phiên bản  | Vai trò & Mô tả                                               |
| :------------------------ | :--------- | :------------------------------------------------------------ |
| **Tailwind CSS**          | `v4.1.17`  | Framework CSS Utility-first giúp xây dựng UI nhanh chóng.     |
| **clsx & tailwind-merge** | `v2.1.1`   | Tiện ích hợp nhất class CSS thông minh, tránh xung đột style. |
| **Lucide React**          | `v0.554.0` | Bộ icon nhẹ, hiện đại và dễ tùy biến.                         |
| **React Toastify**        | `v11.0.5`  | Hệ thống thông báo (Toast notifications) không chặn thao tác. |

### 🗺️ Thư viện Chuyên biệt

| Công nghệ                   | Phiên bản | Vai trò & Mô tả                                          |
| :-------------------------- | :-------- | :------------------------------------------------------- |
| **Leaflet / React-Leaflet** | `v5.0.0`  | Hiển thị bản đồ tương tác, trực quan hóa vùng thiên tai. |
| **Recharts**                | `v3.5.0`  | Vẽ biểu đồ dữ liệu thống kê (Dashboard & Báo cáo).       |
| **Workbox**                 | `v7.4.0`  | Hỗ trợ PWA, caching offline và Service Worker.           |
| **date-fns**                | `v4.1.0`  | Thư viện xử lý, định dạng ngày tháng nhỏ gọn.            |

## 3. Cấu trúc Dự án

Dưới đây là tổ chức mã nguồn của module Frontend:

```bash

frontend/
├── public/                 # Tài sản tĩnh (được phục vụ trực tiếp)
│   └── vite.svg
├── src/                    # Mã nguồn chính
│   ├── assets/             # Các tài sản được import vào mã nguồn (cần xử lý)
│   │   └── react.svg
│   ├── components/         # Các thành phần UI có thể tái sử dụng
│   │   ├── auth/           # Components liên quan đến xác thực
│   │   │   └── ProtectedRoute.jsx
│   │   ├── citizen/        # Components dành riêng cho người dùng Citizen
│   │   │   └── SOSModal.jsx
│   │   ├── common/         # Components dùng chung
│   │   │   ├── Navbar.jsx
│   │   │   └── SovereigntyMarker.jsx
│   │   └── manager/        # Components dành riêng cho người dùng Manager
│   │       └── DashboardMap.jsx
│   ├── constants/          # Các hằng số
│   │   └── stations.js
│   ├── context/            # Quản lý trạng thái toàn cục (Global State)
│   │   ├── AuthContext.jsx
│   │   └── SocketContext.jsx
│   ├── layouts/            # Cấu trúc bố cục trang (Layouts)
│   │   ├── AuthLayout.jsx
│   │   ├── CitizenLayout.jsx
│   │   └── ManagerLayout.jsx
│   ├── pages/              # Các trang chính của ứng dụng (được định tuyến)
│   │   ├── auth/           # Các trang xác thực
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   └── UnauthorizedPage.jsx
│   │   ├── citizen/        # Các trang dành cho người dùng Citizen
│   │   │   ├── CitizenAlertsPage.jsx
│   │   │   ├── CitizenGuidePage.jsx
│   │   │   ├── CitizenHomePage.jsx
│   │   │   ├── CitizenProfile.jsx
│   │   │   └── CitizenReportPage.jsx
│   │   ├── landing/        # Trang giới thiệu
│   │   │   └── LandingPage.jsx
│   │   └── manager/        # Các trang dành cho người dùng Manager
│   │       ├── ManagerAlertsPage.jsx
│   │       ├── ManagerDashboardPage.jsx
│   │       ├── ManagerReportsPage.jsx
│   │       └── ManagerSosPage.jsx
│   ├── services/           # Logic giao tiếp API và nghiệp vụ
│   │   ├── alertService.js
│   │   ├── authService.js
│   │   ├── axiosClient.js
│   │   ├── reportService.js
│   │   ├── safetyService.js
│   │   └── weatherService.js
│   ├── App.css
│   ├── App.jsx             # Component gốc
│   ├── index.css
│   └── main.jsx            # Điểm khởi động của ứng dụng
├── .dockerfile             # Cấu hình Docker
├── .eslintrc.config.js     # Cấu hình ESLint
├── .gitignore              # Danh sách các tệp bị bỏ qua bởi Git
├── index.html              # Tệp HTML chính
├── nginx.conf              # Cấu hình Nginx (có thể dùng để phục vụ ứng dụng)
├── package-lock.json
├── package.json            # Danh sách dependencies và scripts
├── README.md
└── vite.config.js          # Cấu hình Vite

```

## 4. Chức năng Chính

Hệ thống được phân chia thành các phân hệ chức năng riêng biệt dựa trên vai trò người dùng, đảm bảo tính bảo mật và quy trình xử lý thông tin khép kín.

### 🔐 Xác thực & Tài khoản

Chức năng nền tảng giúp quản lý định danh người dùng:

- **Đăng ký (Register):** Tạo tài khoản mới cho người dân.
- **Đăng nhập (Login):** Cơ chế xác thực an toàn để truy cập vào hệ thống.

---

### 🧑‍🤝‍🧑 Phân hệ Người dân (Citizen)

Được thiết kế để tối ưu hóa khả năng tiếp cận thông tin và gửi yêu cầu khẩn cấp nhanh nhất:

1.  **📣 Gửi Phản ánh**

    - Người dân có thể gửi báo cáo về tình hình thiên tai tại khu vực mình đang đứng (kèm hình ảnh, vị trí GPS).
    - Giúp cung cấp dữ liệu thực tế cho ban quản lý.

2.  **🔔 Nhận Thông báo Thiên tai**

    - Nhận các cảnh báo thiên tai chính thống đã được hệ thống kiểm duyệt.
    - Thông báo được đẩy về thiết bị theo thời gian thực (Real-time).

3.  **🆘 Tín hiệu Cầu cứu & Tìm nơi trú ẩn**

    - **SOS:** Kích hoạt tín hiệu cầu cứu khẩn cấp gửi tọa độ trực tiếp đến đội cứu hộ.
    - **Safe Destinations:** Ngay khi kích hoạt SOS hoặc xem bản đồ, hệ thống đề xuất các **Điểm đến an toàn** (nhà cộng đồng, trường học, điểm cao) và lộ trình di chuyển để người dân tự sơ tán trước khi đội cứu hộ đến.

4.  **📖 Cẩm nang Phòng chống Thiên tai**
    - Kho thư viện kiến thức số hóa về các kỹ năng sinh tồn, chuẩn bị trước, trong và sau bão lũ.

---

### 👮 Phân hệ Nhà quản lý (Manager)

Trung tâm điều hành giúp ra quyết định dựa trên dữ liệu (Data-Driven Decision Making):

1.  **📊 Dashboard Điều hành**

    - **Biểu đồ thống kê:** Trực quan hóa dữ liệu lượng mưa, mực nước theo thời gian thực.
    - **Giám sát trạm:** Danh sách trạng thái hoạt động của các trạm đo đạc/cảnh báo (Online/Offline) được cập nhật liên tục.
    - **Bản đồ trực quan:** Hiển thị bản đồ thông báo các trạm cảnh báo.

2.  **📩 Xử lý Phản ánh (Report Handling)**

    - Tiếp nhận danh sách phản ánh từ người dân.
    - Duyệt, xác minh thông tin hoặc từ chối phản ánh sai lệch.

3.  **🚨 Điều phối Cứu hộ (SOS Management)**

    - Nhận tín hiệu SOS nổi bật trên bản đồ thời gian thực.
    - Thay đổi trạng thái xử lý (Đã tiếp nhận, Đang ứng cứu, Đã hoàn thành) để điều phối nguồn lực hiệu quả.

4.  **📡 Giám sát Cảnh báo từ Trạm (IoT Monitoring)**
    - Hệ thống tự động nhận tín hiệu cảnh báo thiên tai từ các trạm cảm biến.
    - Cập nhật liên tục các chỉ số nguy hiểm (vượt mức báo động lũ, sạt lở) để Manager kịp thời phát lệnh sơ tán.
