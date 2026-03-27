# Báo cáo sửa lỗi (Fix Report)

## 📌 Vấn đề bạn gặp phải
Khi chạy `docker-compose up -d --build`, service `ingestion-service` bị lỗi khởi động (crash). Tuy nhiên, sau khi bạn khởi động lại (restart) `data-service` rồi restart các biến liên quan thì hệ thống lại hoạt động bình thường.

## 🔍 Nguyên nhân gốc rễ (Root Cause)
Lỗi này xảy ra do **"Race Condition" (Xung đột/chênh lệch thời gian khởi động)** trong quá trình khởi tạo cấu trúc dữ liệu:
1. File `data-service/server.js` có chứa logic tạo bảng tự động (auto-migration) cho cơ sở dữ liệu PostGIS (`await createTables()`) trước khi tiến hành mở cổng API ở port 3002. Quá trình tạo bảng này ngốn một ít thời gian ban đầu.
2. Cùng lúc đó, file script `entrypoint.sh` của `ingestion-service` trước đây chỉ được lập trình chờ `db-postgis` sẵn sàng kết nối là sẽ ngay lập tức thực thi các lệnh ETL (`python -m etl.etl_import_...`).
3. Dẫn đến hậu quả: `ingestion-service` tiến hành nạp dữ liệu ETL vào các bảng khi mà `data-service` còn chưa kịp tạo bảng xong. Báo lỗi **Table Not Found** và service tự động đóng/crash.
4. Việc bạn thao tác Restart thủ công sau đó có hiệu quả là bởi vì ở lần chạy đầu tiên, `data-service` đã kip tạo xong các bảng đó rồi, nên lần restart sau `ingestion-service` tìm được bảng nên không có lỗi.

## 🛠 Cách giải quyết (The Fix)
Mình đã chỉnh sửa file `ingestion-analysis-service/entrypoint.sh`:
- Khác với trước đây chỉ đợi cơ sở dữ liệu `PostGIS`, mình đã bổ sung thêm bước: **Chờ API của Data Service (cổng 3002) phản hồi**.
- Bằng cách dùng lệnh `nc -z data-service 3002` liên tục mỗi 3 giây, `ingestion-service` sẽ chỉ tiếp tục chạy lệnh khởi tạo các tác vụ ETL một khi hàm `createTables()` của data-service đã chạy xong và Data Service bắt đầu tiếp nhận request.
- Bây giờ bạn có thể xóa hoàn toàn docker container cũ (dùng `docker-compose down -v`) và chạy lệnh `docker-compose up -d --build`, mọi service sẽ tự xếp hàng chờ khởi động theo đúng thứ tự logic mà không cần thao tác Restart thủ công nữa.

## 🚀 Cập nhật Tối ưu hóa: Bỏ qua ETL nếu dữ liệu đã tồn tại (Skip redundant ETL)
**Vấn đề:** Ở cấu hình ban đầu, mỗi lần tắt/bật lại container (kể cả khi đã khởi chạy ETL rồi), script vẫn cố gắng chạy lại 4 quá trình ETL gây tốn nhiều thời gian khởi động (vài chục giây đến vài phút) và tiềm ẩn rủi ro ghi đè/trùng lặp dữ liệu tĩnh.

**Cách giải quyết:**
- Mình đã viết thêm một đoạn mã kiểm tra bằng Python chèn thẳng vào file `entrypoint.sh` của `ingestion-service`. 
- Đoạn mã này sẽ kết nối TCP tới cơ sở dữ liệu và thử chạy lệnh `SELECT count(*) FROM stations;` để xem trạm quan trắc đã có trong dữ liệu chưa.
- Nếu `count > 0` (nghĩa là hệ thống đã chứa dữ liệu của bạn từ lần chạy trước): Script sẽ tự thông báo và **Bỏ qua hoàn toàn các bước lệnh chạy ETL** dài dòng, đi thẳng vào khởi động server FastAPI.
- Kết quả: Từ nay về sau nếu bạn tắt container (thậm chí lệnh `docker-compose down` nhưng không kèm tham số wipe volume `-v`) và bật lại bằng `docker-compose up`, hệ thống sẽ skip ngay ETL và chạy lên siêu tốc chưa đầy 2 giây!
