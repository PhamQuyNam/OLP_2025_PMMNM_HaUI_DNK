# Giai đoạn 1: Build React App
FROM node:18-alpine as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Build ra thư mục /dist
RUN npm run build

# Giai đoạn 2: Chạy bằng Nginx
FROM nginx:alpine as production-stage
# Copy file build vào Nginx
COPY --from=build-stage /app/dist /usr/share/nginx/html
# Copy cấu hình Nginx tùy chỉnh
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]