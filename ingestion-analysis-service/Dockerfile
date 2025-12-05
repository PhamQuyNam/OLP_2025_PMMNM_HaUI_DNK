FROM python:3.9-alpine 

ENV PYTHONUNBUFFERED=1
WORKDIR /app

# Cài đặt công cụ biên dịch (Build Tools) cần thiết cho Pandas và Scikit-learn
# Cần build-base, musl-dev, và python3-dev để biên dịch C/C++ extensions
RUN apk update && \
    apk add --no-cache gcc musl-dev python3-dev build-base && \
    # Cài đặt netcat (nc) để kiểm tra kết nối PostGIS
    apk add --no-cache netcat-openbsd

COPY requirements.txt .
# Giờ lệnh pip install sẽ thành công vì các compiler đã có
RUN pip install --no-cache-dir -r requirements.txt

# Copy Entrypoint Script và toàn bộ code
COPY . .

# Cấp quyền thực thi
RUN chmod +x /app/entrypoint.sh

# Sử dụng ENTRYPOINT để chạy script khởi động (ETL + Server)
ENTRYPOINT ["/app/entrypoint.sh"]