import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api";

// Tạo axios instance với cấu hình mặc định
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor để thêm token vào header
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Flag để track refresh token attempts
let isRefreshing = false;
let failedQueue = [];

// Helper function để clear auth state và redirect
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

// Helper function để process failed queue
const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  
  failedQueue = [];
};

// Interceptor để xử lý refresh token
apiClient.interceptors.response.use(
  (response) => {
    // Check for new tokens in response headers (from backend middleware)
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
    const originalRequest = error.config;

    // Chỉ xử lý 401 errors và chưa retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      
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

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        // Tạo request mới để refresh token (không dùng originalRequest)
        const refreshRequest = {
          ...originalRequest,
          headers: {
            ...originalRequest.headers,
            "X-Refresh-Token": refreshToken,
            // Remove Authorization header để tránh conflict
            Authorization: undefined
          },
          _retry: true // Mark as retry để tránh infinite loop
        };

        // Retry original request với refresh token
        const response = await apiClient(refreshRequest);
        
        // Process queued requests
        processQueue(null, response.data?.accessToken || localStorage.getItem("accessToken"));
        
        return response;
        
      } catch (refreshError) {
        // Refresh token failed
        console.error("Refresh token failed:", refreshError);
        
        // Process queued requests with error
        processQueue(refreshError, null);
        
        // Clear auth state và redirect
        clearAuthAndRedirect();
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Nếu đã retry rồi mà vẫn 401, clear auth state
    if (error.response?.status === 401 && originalRequest._retry) {
      console.error("Request failed after retry, clearing auth state");
      clearAuthAndRedirect();
    }

    return Promise.reject(error);
  }
);

// Hàm fetchApi chính để handle tất cả API calls
export const fetchApi = async ({
  method = "GET",
  url,
  data = null,
  params = null,
  headers = {},
  timeout = 30000,
}) => {
  try {
    const config = {
      method: method.toUpperCase(),
      url,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      timeout,
    };

    if (data) {
      config.data = data;
    }

    if (params) {
      config.params = params;
    }

    const response = await apiClient(config);
    return {
      success: true,
      data: response.data,
      status: response.status,
      headers: response.headers,
    };
  } catch (error) {
    const errorResponse = {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status || 500,
      message: error.response?.data?.message || error.message,
    };

    // Log error for debugging
    console.error(`API Error [${method} ${url}]:`, errorResponse);

    throw errorResponse;
  }
};


// Utility functions
export const apiUtils = {
  // Tạo query key cho pagination
  createPaginatedQueryKey: (baseKey, page, limit, filters = {}) => {
    return [baseKey, { page, limit, ...filters }];
  },

  // Tạo query key cho detail
  createDetailQueryKey: (baseKey, id) => {
    return [baseKey, id];
  },

  // Tạo query key cho list
  createListQueryKey: (baseKey, filters = {}) => {
    return [baseKey, "list", filters];
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");
    return !!(token && refreshToken);
  },

  // Get current user info
  getCurrentUser: () => {
    try {
      const userStr = localStorage.getItem("user");
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error("Error parsing user data:", error);
      return null;
    }
  },

  // Clear all auth data
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

  // Check if token is expired (basic check)
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

export default apiClient;
