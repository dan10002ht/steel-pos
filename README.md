# Steel POS - Hệ thống quản lý cửa hàng sắt thép

Hệ thống quản lý cửa hàng sắt thép với backend Go và frontend React.

## 🚀 Tính năng chính

- **Quản lý sản phẩm**: Thêm, sửa, xóa, phân loại sản phẩm
- **Quản lý kho**: Nhập xuất tồn kho, theo dõi tồn kho
- **Quản lý đơn hàng**: Tạo đơn hàng, theo dõi trạng thái, thanh toán
- **Quản lý khách hàng**: Thông tin khách hàng, công nợ
- **Báo cáo**: Doanh thu, tồn kho, lợi nhuận
- **Phân quyền**: Admin, nhân viên, kế toán

## 🛠 Công nghệ sử dụng

### Backend

- **Go 1.21+** - Ngôn ngữ lập trình
- **Gin** - Web framework
- **PostgreSQL** - Database
- **pgx** - PostgreSQL driver
- **JWT** - Authentication
- **Logrus** - Logging

### Frontend

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **React Router** - Routing
- **TanStack Query** - Data fetching
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

## 📁 Cấu trúc dự án

```
steel-pos/
├── backend/           # Backend Go API
│   ├── cmd/          # Entry points
│   ├── internal/     # Internal packages
│   ├── pkg/          # Public packages
│   ├── migrations/   # Database migrations
│   └── docs/         # API documentation
├── frontend/         # Frontend React app
│   ├── src/          # Source code
│   ├── public/       # Public assets
│   └── dist/         # Build output
└── docs/             # Project documentation
```

## 🚀 Quick Start

### Prerequisites

- Go 1.21+
- Node.js 18+
- PostgreSQL 12+
- Git

### 1. Clone repository

```bash
git clone <repository-url>
cd steel-pos
```

### 2. Setup Backend

```bash
cd backend

# Install dependencies
make deps

# Copy environment file
cp env.example .env

# Edit .env file with your database configuration
# DB_HOST=localhost
# DB_PORT=5432
# DB_USER=postgres
# DB_PASSWORD=your_password
# DB_NAME=steel_pos

# Create database
createdb steel_pos

# Run the application
make run
```

### 3. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
echo "VITE_API_URL=http://localhost:8080/api/v1" > .env

# Run the application
npm run dev
```

### 4. Access the application

- Frontend: http://localhost:5173
- Backend API: http://localhost:8080
- API Documentation: http://localhost:8080/docs

## 📋 Checklist tính năng

Dựa trên checklist trong `pos_checklist.md`:

### ✅ Đã hoàn thành (Boilerplate)

- [x] Phân tích & thiết kế hệ thống
- [x] Setup backend Go với cấu trúc clean architecture
- [x] Setup frontend React với Vite
- [x] Cấu hình database PostgreSQL
- [x] Authentication system
- [x] Basic routing và layout
- [x] API service layer

### 🔄 Đang thực hiện

- [ ] Implement database models
- [ ] Implement repository layer
- [ ] Implement business logic services
- [ ] Complete CRUD operations

### 📝 Cần thực hiện

- [ ] Quản lý sản phẩm (CRUD)
- [ ] Quản lý kho (nhập/xuất/tồn)
- [ ] Quản lý đơn hàng (tạo/sửa/xóa)
- [ ] Quản lý khách hàng (CRUD)
- [ ] Báo cáo & thống kê
- [ ] Phân quyền người dùng
- [ ] In hóa đơn
- [ ] Quét mã vạch
- [ ] Export/Import dữ liệu

## 🧪 Development

### Backend Commands

```bash
cd backend

make deps        # Install dependencies
make run         # Run development server
make build       # Build application
make test        # Run tests
make clean       # Clean build artifacts
```

### Frontend Commands

```bash
cd frontend

npm install      # Install dependencies
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## 📚 API Documentation

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

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

Nếu bạn có câu hỏi hoặc cần hỗ trợ, vui lòng tạo issue trên GitHub hoặc liên hệ:

- Email: [your-email@example.com]
- GitHub: [your-github-username]

## 🙏 Acknowledgments

- [Gin](https://github.com/gin-gonic/gin) - Web framework for Go
- [React](https://reactjs.org/) - UI library
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Vite](https://vitejs.dev/) - Build tool
