# JWT Authentication Flow

## 🔐 Overview

Steel POS sử dụng JWT (JSON Web Tokens) cho authentication với 2 loại tokens:

- **Access Token**: Ngắn hạn (15 phút) - dùng cho API calls
- **Refresh Token**: Dài hạn (7 ngày) - dùng để refresh access token

## 📋 Token Flow

### 1. Login Flow

```
User Login → Validate Credentials → Generate Access + Refresh Tokens → Store Refresh Token in Redis → Return Tokens
```

### 2. API Request Flow

```
API Request → Validate Access Token → If Valid → Process Request
                                    → If Expired → Check Refresh Token → Generate New Tokens → Continue
```

### 3. Token Refresh Flow

```
Access Token Expired → Send Refresh Token → Validate Refresh Token → Generate New Access + Refresh Tokens → Return New Tokens
```

## 🛠️ Implementation

### Configuration

```env
# JWT Configuration
JWT_SECRET=your-secret-key-here
JWT_ACCESS_TOKEN_EXPIRY=15m
JWT_REFRESH_TOKEN_EXPIRY=7d
```

### Token Structure

#### Access Token Claims

```json
{
  "user_id": 1,
  "username": "admin",
  "role": "admin",
  "exp": 1640995200,
  "iat": 1640994300,
  "nbf": 1640994300,
  "iss": "steel-pos-backend",
  "sub": "1"
}
```

#### Refresh Token Storage (Redis)

```json
{
  "user_id": 1,
  "username": "admin",
  "role": "admin",
  "token_id": "uuid-here",
  "created_at": "2024-01-01T00:00:00Z",
  "expires_at": "2024-01-08T00:00:00Z",
  "is_revoked": false
}
```

## 🔄 API Endpoints

### Authentication

- `POST /api/auth/login` - Login và nhận tokens
- `POST /api/auth/refresh` - Refresh tokens
- `POST /api/auth/logout` - Logout và revoke tokens

### Request Headers

```
Authorization: Bearer <access_token>
X-Refresh-Token: <refresh_token>  # Chỉ khi access token expired
```

### Response Headers (Khi refresh)

```
X-New-Access-Token: <new_access_token>
X-New-Refresh-Token: <new_refresh_token>
X-Token-Expires-In: <expires_in_seconds>
```

## 🛡️ Security Features

### 1. Token Rotation

- Mỗi lần refresh sẽ tạo cả access token và refresh token mới
- Refresh token cũ sẽ bị revoked

### 2. Token Revocation

- Refresh tokens được lưu trong Redis với TTL
- Có thể revoke individual tokens hoặc tất cả tokens của user

### 3. Automatic Token Refresh

- Middleware tự động handle token refresh khi access token expired
- Client chỉ cần gửi refresh token trong header `X-Refresh-Token`

### 4. Error Handling

- Specific error messages cho từng loại lỗi
- Proper HTTP status codes

## 📱 Frontend Integration

### Axios Interceptor Example

```javascript
// Request interceptor
axios.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
axios.interceptors.response.use(
  (response) => {
    // Check for new tokens in headers
    const newAccessToken = response.headers["x-new-access-token"];
    const newRefreshToken = response.headers["x-new-refresh-token"];

    if (newAccessToken) {
      localStorage.setItem("accessToken", newAccessToken);
    }
    if (newRefreshToken) {
      localStorage.setItem("refreshToken", newRefreshToken);
    }

    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        // Retry request with refresh token
        error.config.headers["X-Refresh-Token"] = refreshToken;
        return axios.request(error.config);
      }
    }
    return Promise.reject(error);
  }
);
```

## 🔧 Development

### Testing Tokens

```bash
# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}'

# Use access token
curl -X GET http://localhost:8080/api/users \
  -H "Authorization: Bearer <access_token>"

# Refresh token
curl -X POST http://localhost:8080/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refresh_token":"<refresh_token>"}'
```

### Redis Commands

```bash
# Check refresh tokens
redis-cli -p 6380 KEYS "refresh_token:*"

# Get specific token
redis-cli -p 6380 GET "refresh_token:<token_id>"

# Revoke token
redis-cli -p 6380 DEL "refresh_token:<token_id>"
```

## 🚀 Best Practices

1. **Token Storage**: Lưu access token trong memory, refresh token trong secure storage
2. **Token Rotation**: Luôn rotate refresh tokens khi refresh
3. **Error Handling**: Handle 401 errors gracefully với automatic refresh
4. **Logout**: Revoke refresh tokens khi logout
5. **Monitoring**: Monitor token usage và suspicious activities
6. **Cleanup**: Regular cleanup expired tokens từ Redis
