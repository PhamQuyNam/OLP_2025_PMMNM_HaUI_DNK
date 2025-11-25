FROM nginx:alpine

# Xóa cấu hình mặc định của Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copy file cấu hình của mình vào
COPY nginx.conf /etc/nginx/nginx.conf

# Expose cổng 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]