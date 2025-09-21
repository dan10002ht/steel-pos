# API Authentication & Token Refresh Logic

## Vấn đề đã được sửa

### ❌ **Logic cũ có vấn đề:**
1. **Infinite retry loop** - Có thể retry vô hạn khi refresh token fail
2. **Không handle concurrent requests** - Nhiều request cùng lúc có thể gây conflict
3. **Không clear state properly** - Khi refresh fail, state không được clear đúng cách
4. **Không có queue mechanism** - Các request khác không được handle khi đang refresh

### ✅ **Logic mới đã sửa:**

## 1. **Refresh Token Queue System**

```javascript
let isRefreshing = false;
let failedQueue = [];
```

- **`isRefreshing`**: Flag để track xem có đang refresh token không
- **`failedQueue`**: Queue để store các request đang chờ refresh token

## 2. **Concurrent Request Handling**

```javascript
// Nếu đang refresh, thêm request vào queue
if (isRefreshing) {
  return new Promise((resolve, reject) => {
    failedQueue.push({ resolve, reject });
  }).then(token => {
    originalRequest.headers.Authorization = `Bearer ${token}`;
    return apiClient(originalRequest);
  }).catch(err => {
    return Promise.reject(err);
  });
}
```

**Cách hoạt động:**
- Khi có request 401 và đang refresh token
- Thêm request vào queue thay vì retry ngay
- Khi refresh thành công, process tất cả queued requests
- Khi refresh fail, reject tất cả queued requests

## 3. **Proper Error Handling**

```javascript
// Nếu đã retry rồi mà vẫn 401, clear auth state
if (error.response?.status === 401 && originalRequest._retry) {
  console.error("Request failed after retry, clearing auth state");
  clearAuthAndRedirect();
}
```

**Các trường hợp được handle:**
- ✅ Refresh token không tồn tại
- ✅ Refresh token expired
- ✅ Refresh token invalid
- ✅ Network error khi refresh
- ✅ Backend error khi refresh

## 4. **State Management**

```javascript
const clearAuthAndRedirect = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
  isRefreshing = false;
  failedQueue = [];
  
  // Chỉ redirect nếu không phải đang ở trang login
  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
};
```

**Tính năng:**
- Clear tất cả auth data
- Reset refresh flags
- Clear failed queue
- Smart redirect (không redirect nếu đã ở login page)

## 5. **Utility Functions**

```javascript
export const apiUtils = {
  // Check authentication status
  isAuthenticated: () => {
    const token = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");
    return !!(token && refreshToken);
  },

  // Get current user
  getCurrentUser: () => {
    try {
      const userStr = localStorage.getItem("user");
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error("Error parsing user data:", error);
      return null;
    }
  },

  // Clear auth data
  clearAuth: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    isRefreshing = false;
    failedQueue = [];
  },

  // Set auth data
  setAuth: (accessToken, refreshToken, user) => {
    if (accessToken) localStorage.setItem("accessToken", accessToken);
    if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
    if (user) localStorage.setItem("user", JSON.stringify(user));
  },

  // Check token expiration
  isTokenExpired: (token) => {
    if (!token) return true;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      console.error("Error checking token expiration:", error);
      return true;
    }
  }
};
```

## Flow Diagram

```
Request 401 Error
       ↓
   Is Refreshing?
   ↙        ↘
  Yes        No
   ↓          ↓
Add to Queue  Start Refresh
   ↓          ↓
Wait for      Set isRefreshing = true
Refresh       ↓
   ↓          Try Refresh Token
   ↓          ↙        ↘
   ↓        Success   Failure
   ↓          ↓          ↓
   ↓        Process    Clear Auth
   ↓        Queue      & Redirect
   ↓          ↓          ↓
   ↓        Retry      Reject All
   ↓        Requests   Requests
   ↓          ↓          ↓
   ↓        Success    End
   ↓          ↓
   ↓        End
   ↓
  End
```

## Test Cases

### 1. **Normal Flow**
```
Request → 401 → Refresh Token → Success → Retry Request → Success
```

### 2. **Concurrent Requests**
```
Request A → 401 → Start Refresh
Request B → 401 → Add to Queue
Request C → 401 → Add to Queue
Refresh Success → Process Queue → All Requests Success
```

### 3. **Refresh Token Expired**
```
Request → 401 → Refresh Token → 401 → Clear Auth → Redirect to Login
```

### 4. **Network Error**
```
Request → 401 → Refresh Token → Network Error → Clear Auth → Redirect to Login
```

### 5. **No Refresh Token**
```
Request → 401 → No Refresh Token → Clear Auth → Redirect to Login
```

## Usage Examples

```javascript
import { apiUtils } from '@/shared/services/api';

// Check if user is authenticated
if (apiUtils.isAuthenticated()) {
  // User is logged in
}

// Get current user
const user = apiUtils.getCurrentUser();

// Clear auth (logout)
apiUtils.clearAuth();

// Set auth (login)
apiUtils.setAuth(accessToken, refreshToken, userData);

// Check token expiration
const isExpired = apiUtils.isTokenExpired(token);
```

## Benefits

1. **No Infinite Loops** - Proper retry mechanism
2. **Concurrent Request Support** - Queue system handles multiple requests
3. **Proper Error Handling** - All error cases are handled
4. **State Consistency** - Auth state is always consistent
5. **Better UX** - Smooth token refresh without user interruption
6. **Debugging** - Better error logging and state tracking
