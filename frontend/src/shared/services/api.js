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

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
          throw new Error("No refresh token");
        }

        // Add refresh token to headers for backend middleware
        originalRequest.headers["X-Refresh-Token"] = refreshToken;

        // Retry original request with refresh token
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh token failed, redirect to login
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
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
};

export default apiClient;
