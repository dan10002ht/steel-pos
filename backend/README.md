# Steel POS Backend

Backend API cho hệ thống quản lý bán hàng Steel POS.

## 🚀 Quick Start

### Prerequisites

- Go 1.21+
- PostgreSQL 12+
- Make

### Installation

1. Clone repository:

```bash
git clone <repository-url>
cd steel-pos/backend
```

2. Install dependencies:

```bash
make deps
```

3. Setup environment variables:

```bash
cp env.example .env
# Edit .env file with your database configuration
```

4. Run database migrations:

```bash
make migrate-up
```

5. Run the application:

```bash
make run
```

## 📊 Database Migrations

### Available Commands

```bash
# Run all pending migrations
make migrate-up

# Rollback last migration
make migrate-down

# Check current migration version
make migrate-version

# Force migration to specific version
make migrate-force VERSION=1

# Create new migration file
make migrate-create NAME=add_new_table
```

### Migration Files

- `000001_create_initial_schema.up.sql` - Tạo schema cơ bản
- `000001_create_initial_schema.down.sql` - Rollback schema
- `000002_insert_initial_data.up.sql` - Insert dữ liệu mẫu
- `000002_insert_initial_data.down.sql` - Rollback dữ liệu
- `000003_add_inventory_update_function.up.sql` - Thêm functions cho inventory
- `000003_add_inventory_update_function.down.sql` - Rollback functions

## 🏗️ Database Schema

### Core Tables

#### Users

- Quản lý người dùng và phân quyền
- Roles: admin, manager, accountant, user

#### Products & Product Variants

- Quản lý sản phẩm với variants
- Tracking stock và sold quantities

#### Import Orders

- Quản lý đơn nhập kho
- Workflow: pending → approved
- Auto-update inventory khi approve

#### Suppliers

- Quản lý nhà cung cấp

#### Inventory History

- Track lịch sử thay đổi tồn kho
- Reference đến import orders, sales, etc.

### Key Functions

#### `update_inventory_on_import_approval(import_order_id, approved_by)`

- Cập nhật tồn kho khi approve đơn nhập
- Tạo inventory history records
- Update import order status

#### `generate_next_import_code()`

- Tự động generate mã đơn nhập tiếp theo

#### `calculate_import_order_total(import_order_id)`

- Tính tổng giá trị đơn nhập

## 🔧 Development

### Environment Variables

```bash
DB_HOST=localhost
DB_PORT=5432
DB_NAME=steel_pos
DB_USER=postgres
DB_PASSWORD=password
JWT_SECRET=your-secret-key
```

### API Endpoints

#### Authentication

- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/logout` - Đăng xuất
- `POST /api/auth/refresh` - Refresh token

#### Products

- `GET /api/products` - Danh sách sản phẩm
- `POST /api/products` - Tạo sản phẩm mới
- `GET /api/products/:id` - Chi tiết sản phẩm
- `PUT /api/products/:id` - Cập nhật sản phẩm
- `DELETE /api/products/:id` - Xóa sản phẩm

#### Import Orders

- `GET /api/import-orders` - Danh sách đơn nhập
- `POST /api/import-orders` - Tạo đơn nhập mới
- `GET /api/import-orders/:id` - Chi tiết đơn nhập
- `PUT /api/import-orders/:id` - Cập nhật đơn nhập
- `POST /api/import-orders/:id/approve` - Phê duyệt đơn nhập

#### Suppliers

- `GET /api/suppliers` - Danh sách nhà cung cấp
- `POST /api/suppliers` - Tạo nhà cung cấp mới

## 🧪 Testing

```bash
# Run all tests
make test

# Run specific test
go test ./internal/handlers -v
```

## 📦 Build

```bash
# Build for development
make build

# Build for production
make build-prod
```

## 🔍 Monitoring

- Logs được ghi vào stdout/stderr
- Sử dụng logrus cho structured logging
- Health check endpoint: `GET /health`

## 📝 Notes

- Tất cả timestamps sử dụng UTC
- UUID được sử dụng cho primary keys
- Soft delete với `is_active` flag
- Auto-update `updated_at` với triggers
