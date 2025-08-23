# Steel POS Backend

Backend API cho hệ thống quản lý cửa hàng sắt thép.

## Công nghệ sử dụng

- **Go 1.21+**
- **Gin** - Web framework
- **PostgreSQL** - Database
- **pgx** - PostgreSQL driver
- **JWT** - Authentication
- **Logrus** - Logging

## Cấu trúc dự án

```
backend/
├── cmd/
│   └── server/          # Entry point
├── internal/
│   ├── config/          # Configuration
│   ├── handlers/        # HTTP handlers
│   ├── middleware/      # Middleware
│   ├── models/          # Data models
│   ├── repository/      # Data access layer
│   └── services/        # Business logic
├── pkg/
│   ├── database/        # Database connection
│   ├── logger/          # Logging utilities
│   └── utils/           # Common utilities
├── migrations/          # Database migrations
└── docs/               # API documentation
```

## Setup

### 1. Cài đặt dependencies

```bash
make deps
```

### 2. Cấu hình môi trường

Copy file env.example thành .env và cấu hình:

```bash
cp env.example .env
```

### 3. Cấu hình database

- Cài đặt PostgreSQL
- Tạo database `steel_pos`
- Cập nhật thông tin kết nối trong file .env

### 4. Chạy ứng dụng

```bash
# Development
make run

# Build và chạy
make build
./bin/server
```

## API Endpoints

### Health Check

- `GET /health` - Kiểm tra trạng thái server

### Authentication

- `POST /api/v1/auth/login` - Đăng nhập
- `POST /api/v1/auth/register` - Đăng ký

### Products

- `GET /api/v1/products` - Lấy danh sách sản phẩm
- `GET /api/v1/products/:id` - Lấy sản phẩm theo ID
- `POST /api/v1/products` - Tạo sản phẩm mới
- `PUT /api/v1/products/:id` - Cập nhật sản phẩm
- `DELETE /api/v1/products/:id` - Xóa sản phẩm

### Orders

- `GET /api/v1/orders` - Lấy danh sách đơn hàng
- `GET /api/v1/orders/:id` - Lấy đơn hàng theo ID
- `POST /api/v1/orders` - Tạo đơn hàng mới
- `PUT /api/v1/orders/:id` - Cập nhật đơn hàng
- `DELETE /api/v1/orders/:id` - Xóa đơn hàng

### Customers

- `GET /api/v1/customers` - Lấy danh sách khách hàng
- `GET /api/v1/customers/:id` - Lấy khách hàng theo ID
- `POST /api/v1/customers` - Tạo khách hàng mới
- `PUT /api/v1/customers/:id` - Cập nhật khách hàng
- `DELETE /api/v1/customers/:id` - Xóa khách hàng

### Inventory

- `GET /api/v1/inventory` - Lấy danh sách tồn kho
- `GET /api/v1/inventory/:id` - Lấy tồn kho theo ID
- `POST /api/v1/inventory/in` - Nhập kho
- `POST /api/v1/inventory/out` - Xuất kho

## Development

### Hot reload (cần cài air)

```bash
go install github.com/cosmtrek/air@latest
make dev
```

### Testing

```bash
make test
```

## Production

```bash
make build-prod
```

## TODO

- [ ] Implement database models
- [ ] Implement repository layer
- [ ] Implement business logic services
- [ ] Add JWT authentication
- [ ] Add database migrations
- [ ] Add comprehensive tests
- [ ] Add API documentation
- [ ] Add Docker support
