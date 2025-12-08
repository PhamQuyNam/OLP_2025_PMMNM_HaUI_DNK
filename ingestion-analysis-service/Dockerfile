FROM python:3.9-alpine 

ENV PYTHONUNBUFFERED=1
WORKDIR /app

# 1. Cài đặt công cụ biên dịch (Build Tools) cần thiết cho Pandas và Scikit-learn
RUN apk update && \
    apk add --no-cache gcc musl-dev python3-dev build-base gfortran && \
    # 2. Cài đặt netcat và dos2unix (Lớp bảo vệ CRLF)
    apk add --no-cache netcat-openbsd dos2unix

COPY requirements.txt .
# Lệnh pip install giờ sẽ thành công vì các compiler đã có
RUN pip install --no-cache-dir -r requirements.txt

# Copy Entrypoint Script và toàn bộ code
COPY . .

# 3. FIX QUAN TRỌNG: Chạy dos2unix để chuyển đổi định dạng dòng trước khi cấp quyền
# Lệnh này đảm bảo file shell scripts (như entrypoint.sh) không có ký tự CRLF từ Windows
RUN dos2unix /app/entrypoint.sh && \
    chmod +x /app/entrypoint.sh

# Sử dụng ENTRYPOINT với cú pháp chính xác
ENTRYPOINT ["/bin/sh", "/app/entrypoint.sh"]