FROM python:3.9

ENV PYTHONUNBUFFERED=1
WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Sửa dòng này trỏ vào main.py
CMD ["sh", "-c", "export PYTHONPATH=$PYTHONPATH:/app && python /app/main.py"]