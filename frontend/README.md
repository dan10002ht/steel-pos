# Steel POS Frontend

Frontend React application cho hệ thống quản lý bán hàng sắt thép.

## 🚀 Quick Start

### Prerequisites

- Node.js (v18+)
- Yarn

### Installation

```bash
cd frontend
yarn install
```

### Development

```bash
yarn dev
```

Frontend sẽ chạy tại: http://localhost:5173

### Build

```bash
yarn build
```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable components
│   ├── contexts/           # React contexts (Auth, etc.)
│   ├── pages/              # Page components
│   │   ├── products/       # Product management pages
│   │   └── ...
│   ├── services/           # API services
│   ├── hooks/              # Custom hooks
│   ├── utils/              # Utility functions
│   ├── App.jsx             # Main app component
│   └── main.jsx            # Entry point
├── public/                 # Static assets
└── package.json
```

## 🔐 Authentication

### Login Flow

1. User truy cập `/login`
2. Nhập username/password
3. Frontend gọi API `/api/auth/login`
4. Nhận access token và refresh token
5. Lưu tokens vào localStorage
6. Redirect đến `/dashboard`

### Token Management

- **Access Token**: 15 phút, tự động refresh
- **Refresh Token**: 7 ngày, lưu trong localStorage
- **Automatic Refresh**: Axios interceptor tự động handle

### Demo Accounts

```
Username: admin
Password: admin123
```

## 🛠️ Technologies

- **React 19** - UI library
- **Vite** - Build tool
- **Chakra UI** - Component library
- **React Router** - Routing
- **Axios** - HTTP client
- **Lucide React** - Icons

## 📱 Features

### ✅ Completed

- [x] Authentication system
- [x] Login page
- [x] Protected routes
- [x] Token management
- [x] Product management pages
- [x] Import order pages
- [x] Responsive design

### 🔄 In Progress

- [ ] Dashboard
- [ ] Sales management
- [ ] Customer management
- [ ] Reports & Analytics

## 🔧 Development

### Environment Variables

```env
VITE_API_URL=http://localhost:8080/api
```

### API Integration

- Base URL: `http://localhost:8080/api`
- Authentication: JWT Bearer tokens
- Error handling: Axios interceptors

### Styling

- Chakra UI components
- Responsive design
- Dark/Light mode support

## 🚀 Deployment

### Build for Production

```bash
yarn build
```

### Serve Production Build

```bash
yarn preview
```

## 📝 Notes

- Frontend sử dụng Chakra UI cho consistent design
- Authentication state được quản lý qua React Context
- API calls được handle qua Axios với automatic token refresh
- Responsive design cho mobile và desktop
