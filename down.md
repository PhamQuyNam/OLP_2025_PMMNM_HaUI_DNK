# HƯỚNG DẪN CÀI ĐẶT VÀ VẬN HÀNH DỰ ÁN VIET RESILIENCE HUB

Chào mừng bạn đến với hệ thống Cảnh báo Thiên tai Trực tuyến. Để chạy được dự án này một cách mượt mà nhất trên máy tính cá nhân (Windows), vui lòng thực hiện theo các bước chi tiết dưới đây.

---

## 🛠 BƯỚC 1: CÀI ĐẶT MÔI TRƯỜNG (CHỈ LÀM 1 LẦN DUY NHẤT)

Dự án sử dụng công nghệ **Docker** để đảm bảo tính đồng nhất. Máy tính của bạn cần có **WSL 2** và **Docker Desktop**.

### 1.1. Cài đặt WSL 2 (Windows Subsystem for Linux)
1. Mở **PowerShell** (hoặc Command Prompt) với quyền Quản trị viên (Run as Administrator).
2. Nhập lệnh sau và nhấn Enter:
   ```powershell
   wsl --install
   ```
3. Khởi động lại máy tính nếu được yêu cầu. (Nếu máy bạn đã cài WSL rồi, bước này sẽ diễn ra rất nhanh).

### 1.2. Cài đặt Docker Desktop
1. Truy cập trang chủ Docker: [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/)
2. Tải bản cài đặt cho Windows và chạy file `.exe`.
3. Trong quá trình cài đặt, hãy đảm bảo ô **"Use WSL 2 instead of Hyper-V"** đã được tích chọn.
4. Sau khi cài xong, mở **Docker Desktop** lên và chờ cho biểu tượng con cá voi ở góc dưới bên trái chuyển sang màu xanh (Status: Running).

---

## 🚀 BƯỚC 2: KHỞI CHẠY DỰ ÁN

Sau khi đã có Docker, việc chạy dự án chỉ mất vài phút.

1. **Giải nén file:** Giải nén file `.zip` của dự án vào một thư mục trên máy tính (Ví dụ: `D:\OLP_Project`).
2. **Kiểm tra file cấu hình:** Đảm bảo file `.env` (file chứa mã bí mật và API Key) đã nằm ở thư mục gốc của dự án.
3. **Mở Terminal:** 
   * Truy cập vào thư mục chứa dự án.
   * Chuột phải vào khoảng trống và chọn **"Open in Terminal"** (hoặc gõ `cmd` vào thanh địa chỉ thư mục).
4. **Chạy lệnh thần chưởng:** Nhập lệnh sau và nhấn Enter:
   ```powershell
   docker-compose up -d --build
   ```
   * *Hệ thống sẽ tự động tải các thư viện, xây dựng các máy chủ ảo và nạp dữ liệu môi trường. Quá trình này mất khoảng 2-5 phút tùy tốc độ mạng.*

---

## 🌐 BƯỚC 3: TRUY CẬP ỨNG DỤNG

Khi Terminal báo hoàn tất, bạn có thể mở trình duyệt và truy cập các địa chỉ sau:

* **Giao diện chính (Frontend):** [http://localhost:3001](http://localhost:3001)
* **Cổng API (Backend/Gateway):** [http://localhost:8000](http://localhost:8000)
* **Tài liệu API (Swagger UI):** [http://localhost:8000/api-docs](http://localhost:8000/api-docs) (Dùng để kiểm tra các phương thức kết nối).

---

## 🛑 BƯỚC 4: DỪNG VÀ DỌN DẸP

Khi không muốn chạy dự án nữa, bạn quay lại Terminal và gõ:
```powershell
docker-compose down
```
*Lưu ý: Nếu muốn xóa sạch toàn bộ dữ liệu cũ để chạy lại từ đầu như máy mới, hãy dùng lệnh `docker-compose down -v`.*

---

### 📝 GHI CHÚ CHO GIÁM KHẢO:
* Dự án đã được tối ưu hóa để chạy "Plug-and-Play". 
* Không cần cài đặt Python, Node.js hay Database cục bộ trên máy chủ.
* Mọi cấu hình nhạy cảm đã được đóng gói trong file `.env` đi kèm.

**Chúc quý hội đồng có những trải nghiệm tốt nhất với dự án!**
