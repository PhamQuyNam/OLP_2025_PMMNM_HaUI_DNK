Lịch sử thay đổi (Changelog)
Mọi thay đổi đáng chú ý của dự án Viet Resilience Hub sẽ được ghi lại tại tệp này.

[v0.1.0] - 2025-12-04

Đã thêm (Added)

1. Hệ thống Xác thực & Người dùng (Authentication)
   JWT Authentication: Cơ chế Đăng ký và Đăng nhập bảo mật sử dụng JSON Web Token.

Role-based Access Control (RBAC): Phân quyền chặt chẽ giữa Người dân (Citizen) và Nhà quản lý (Manager).

User Profile: Trang quản lý thông tin cá nhân, cho phép cập nhật số điện thoại và mật khẩu.

Protected Routes: Cơ chế bảo vệ đường dẫn, ngăn chặn truy cập trái phép.

2. Phân hệ Người dân (Citizen)
   Smart Map Interface: Tích hợp bản đồ số OpenStreetMap với thư viện Leaflet.

Real-time Geolocation: Tự động định vị và hiển thị vị trí thực tế của người dùng trên bản đồ (GPS).

Weather Stations Layer: Hiển thị lớp dữ liệu các trạm đo mưa thời gian thực (chuẩn NGSI-LD) với icon động theo trạng thái (Xanh/Đỏ).

Crowdsourcing Reporting: Tính năng gửi báo cáo sự cố (Ngập lụt/Sạt lở) kèm tọa độ GPS và thông tin mô tả.

Disaster Guide: Cẩm nang số hướng dẫn kỹ năng sinh tồn và ứng phó thiên tai.

3. Phân hệ Quản lý (Manager Dashboard)
   Overview Statistics: Các thẻ chỉ số thống kê thời gian thực (Lượng mưa trung bình, Số trạm cảnh báo, Số lượng báo cáo).

Interactive Dashboard Map: Bản đồ giám sát trung tâm, hiển thị đồng thời Trạm đo mưa và Sự cố do người dân báo cáo.

Real-time Charts: Biểu đồ diễn biến mưa và Biểu đồ so sánh lượng mưa giữa các trạm (Recharts).

Report Management: Danh sách chi tiết các báo cáo từ cộng đồng với tính năng gọi điện nhanh và xóa báo cáo đã xử lý.

4. Hạ tầng & Triển khai (Infrastructure)
   Microservices Architecture: Cấu trúc dự án phân tách rõ ràng (Auth, Report, Weather Services).

Dockerization: Đóng gói toàn bộ Frontend và Backend vào Docker Containers.

Nginx Gateway: Cấu hình API Gateway (Port 8000) và Frontend Web Server (Port 3001) để định tuyến và phục vụ ứng dụng.

Standardized API: Sử dụng Axios Client với cơ chế Interceptors và Proxy để tối ưu hóa kết nối.
