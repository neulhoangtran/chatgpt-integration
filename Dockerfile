# Sử dụng Node.js mới nhất làm base image
FROM node:latest

# Tạo và đặt thư mục làm việc của ứng dụng
WORKDIR /usr/src/app

# Sao chép package.json và package-lock.json vào thư mục làm việc
COPY package*.json ./

# Cài đặt các phụ thuộc của ứng dụng
RUN npm install -g nodemon
RUN npm install

# Sao chép toàn bộ mã nguồn của ứng dụng vào thư mục làm việc
COPY . .

# Expose cổng mà ứng dụng sẽ chạy
EXPOSE 8200

# Chạy ứng dụng
CMD ["nodemon", "app.js"]
