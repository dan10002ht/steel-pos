# Steel POS

A Point of Sale system for steel trading businesses.

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js (v18+) & Yarn
- Go (v1.21+)

### Development Setup

1. **Start Development Environment:**

   ```bash
   ./dev-local.sh
   ```

   This will:

   - Start PostgreSQL (port 5434), Redis (port 6380), pgAdmin (port 5051)
   - Run database migrations
   - Start backend with hot reload (port 8080)
   - Start frontend (port 5173)

2. **Seed Database (Optional):**
   ```bash
   ./seed-db.sh
   ```
   This will create initial users and sample data.

### Service URLs

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8080
- **pgAdmin**: http://localhost:5051
  - Email: admin@steelpos.com
  - Password: admin123

### Database

- **PostgreSQL**: localhost:5434
  - Database: steel_pos
  - Username: postgres
  - Password: password

## 📁 Project Structure

```
steel-pos/
├── frontend/          # React + Vite + Chakra UI
├── backend/           # Go + Gin + PostgreSQL
├── migrations/        # Database migrations
├── dev-local.sh       # Development environment script
├── seed-db.sh         # Database seeding script
└── docker-compose.dev.yml
```

## 🔧 Development Commands

### Backend

```bash
cd backend
make dev          # Start with hot reload (air)
make build        # Build binary
make test         # Run tests
make migrate-up   # Run migrations
```

### Frontend

```bash
cd frontend
yarn dev          # Start development server
yarn build        # Build for production
yarn lint         # Run linter
```

## 🛠️ Manual Setup

If you prefer to run services manually:

1. **Start Database Services:**

   ```bash
   docker-compose -f docker-compose.dev.yml up -d
   ```

2. **Run Migrations:**

   ```bash
   cd backend
   make migrate-up
   ```

3. **Start Backend:**

   ```bash
   cd backend
   make dev
   ```

4. **Start Frontend:**
   ```bash
   cd frontend
   yarn dev
   ```

## 📝 Environment Variables

Backend environment variables are configured in `backend/.env`:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5434
DB_USER=postgres
DB_PASSWORD=password
DB_NAME=steel_pos

# Server Configuration
SERVER_PORT=8080
SERVER_HOST=0.0.0.0

# JWT Configuration
JWT_SECRET=your-secret-key-here
JWT_ACCESS_TOKEN_EXPIRY=15m
JWT_REFRESH_TOKEN_EXPIRY=7d

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6380
```

## 🔐 Authentication

The system uses JWT-based authentication with role-based access control:

- **Admin**: Full access to all features
- **Manager**: Product and inventory management
- **Accountant**: Financial operations
- **User**: Basic operations

## 📊 Features

- **Product Management**: CRUD operations for products and variants
- **Inventory Management**: Stock tracking and updates
- **Import Orders**: Purchase order management with approval workflow
- **Supplier Management**: Vendor information and relationships
- **User Management**: Role-based access control
