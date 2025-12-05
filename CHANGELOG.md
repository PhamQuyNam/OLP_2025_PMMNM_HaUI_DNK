<!--
  Copyright 2025 HaUI.DNK
  Licensed under the Apache License, Version 2.0
  http://www.apache.org/licenses/LICENSE-2.0
-->
# Lịch sử thay đổi (Changelog)

Mọi thay đổi đáng chú ý của dự án **Viet Resilience Hub** sẽ được ghi lại tại tệp này.

## [v0.1.0] - 2025-12-04 (Phiên bản PoF OLP)

Đây là bản phát hành đầu tiên

### Đã thêm (Added)

- **🔐 Hệ thống Xác thực & Người dùng (Auth Service)**

  - **JWT Authentication:** Đăng ký, Đăng nhập bảo mật.
  - **Role-based Control:** Phân quyền chặt chẽ giữa Người dân (Citizen) và Nhà quản lý (Manager).
  - **User Profile:** Xem và cập nhật thông tin cá nhân (SĐT, Mật khẩu).
  - **Protected Routes:** Cơ chế bảo vệ đường dẫn, chặn truy cập trái phép.

- **🗺️ Phân hệ Người dân (Citizen)**

  - **Interactive Map:** Tích hợp bản đồ số OpenStreetMap & Leaflet.
  - **Real-time GPS:** Tự động định vị vị trí người dùng và hiển thị trên bản đồ.
  - **Weather Monitoring:** Hiển thị trạm đo mưa thực tế (chuẩn NGSI-LD).
  - **Crowdsourcing Report:** Gửi phản ảnh sự cố thiên tai kèm vị trí GPS.
  - **Digital Guide:** Cẩm nang hướng dẫn kỹ năng sinh tồn.

- **📊 Phân hệ Quản lý (Manager Dashboard)**

  - **Overview Statistics:** Thống kê lượng mưa trung bình, số trạm cảnh báo.
  - **Report Management:** Danh sách báo cáo từ cộng đồng, có SĐT liên hệ và tính năng xóa.
  - **Real-time Map:** Giám sát đồng thời các trạm đo mưa và các điểm sự cố do dân báo.
  - **Dynamic Charts:** Biểu đồ diễn biến mưa và so sánh lượng mưa (Recharts).

- **🏗️ Hạ tầng & Triển khai (Infrastructure)**
  - **Microservices:** Kiến trúc tách biệt Auth, Report, Weather Services.
  - **Dockerization:** Đóng gói 100% Frontend và Backend vào Docker.
  - **API Gateway:** Sử dụng Nginx (Port 8000) để điều phối request.
  - **Standardized API:** Cấu hình Axios Client và Proxy để tối ưu kết nối.
