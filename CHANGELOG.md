
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

## [v2.0.0] - 2025-12-08
### Đã thêm (Added)
- **🚨 Hệ thống SOS Khẩn cấp (Real-time SOS):**
    - Người dân gửi tín hiệu cầu cứu kèm tọa độ GPS và xác thực OTP (Email).
    - Nhà quản lý nhận tin báo ngay lập tức (Real-time Socket) và định vị nạn nhân trên bản đồ tác chiến.
    - Quy trình xử lý khép kín: Gửi -> Duyệt -> Cứu hộ thành công -> Cập nhật trạng thái.
- **⚠️ Hệ thống Cảnh báo Thiên tai (Disaster Alert):**
    - Tự động tiếp nhận dữ liệu phân tích từ máy đo (Python Ingestion).
    - Quy trình phê duyệt chặt chẽ: Admin duyệt tin -> Phát sóng diện rộng.
    - Hiển thị trực quan: Vòng tròn cảnh báo (Circle) trên bản đồ với bán kính động theo cấp độ rủi ro (Excel Standard).
- **🗺️ Bản đồ & Chủ quyền số:**
    - Chuyển đổi nền bản đồ sang **CartoDB Voyager** (Giao diện hiện đại, trung tính).
    - **Khẳng định chủ quyền:** Tích hợp nhãn hiển thị quần đảo **Hoàng Sa** và **Trường Sa** (Việt Nam).
    - Hỗ trợ đa điểm cầu: TP. Hà Tĩnh, TP. Hồ Chí Minh, TP. Thái Nguyên.
- **🧭 Dẫn đường nội bộ (In-app Navigation):**
    - Tính năng chỉ đường từ vị trí người dân đến Điểm an toàn gần nhất trực tiếp trên bản đồ ứng dụng (Không phụ thuộc Google Maps).

### 🛠️ Cải tiến (Improvements)

- **Manager Dashboard:**
    - Bộ lọc dữ liệu thông minh (Smart Filter) theo từng thành phố.
    - Biểu đồ và chỉ số thống kê tự động tính toán lại theo khu vực được chọn.
    - Giao diện Dropdown chọn tỉnh phong cách Glassmorphism.
- **Citizen Experience:**
    - Tự động lọc trùng cảnh báo (Deduplication) để tránh spam thông báo.
    - Cơ chế **Fallback Tọa độ 3 lớp**: API -> Dữ liệu trạm -> File tĩnh (Đảm bảo bản đồ không bao giờ lỗi dù API thiếu dữ liệu).
    - Tự động Zoom mượt mà (Smooth Fly/Pan) khi chuyển đổi vị trí.

### 🐛 Sửa lỗi (Bug Fixes)

- Fix lỗi xung đột Zoom bản đồ khi vừa đăng nhập.
- Fix lỗi `ECONNREFUSED` do Race Condition giữa Docker Containers (Thêm Healthcheck cho PostGIS).
- Fix lỗi hiển thị Layer Control của Leaflet.
- Fix lỗi hiển thị thông báo (Toast) bị lặp lại.

### 🏗️ Hạ tầng (Infrastructure)

- Cập nhật `docker-compose.yml` với cơ chế Healthcheck chuẩn.
- Bảo mật file môi trường: Cập nhật `.gitignore` loại bỏ `.env` và thêm `.env.example`.
  
