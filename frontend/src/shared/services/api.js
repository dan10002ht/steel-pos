import axios from "axios";

// Base URLs
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";
const PUBLIC_API_URL = `${API_BASE_URL}/public`;
const PROTECTED_API_URL = `${API_BASE_URL}/protected`;

// Create axios instances
const publicApi = axios.create({
  baseURL: PUBLIC_API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

const protectedApi = axios.create({
  baseURL: PROTECTED_API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for protected API
protectedApi.interceptors.request.use(
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

// Response interceptor for both APIs
const responseInterceptor = (response) => {
  return response.data;
};

const errorInterceptor = (error) => {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;

    switch (status) {
      case 401:
        // Unauthorized - redirect to login
        localStorage.removeItem("accessToken");
        window.location.href = "/login";
        break;
      case 403:
        // Forbidden
        console.error("Access forbidden:", data.message);
        break;
      case 404:
        // Not found
        console.error("Resource not found:", data.message);
        break;
      case 422:
        // Validation error
        console.error("Validation error:", data.errors);
        break;
      case 500:
        // Server error
        console.error("Server error:", data.message);
        break;
      default:
        console.error("API error:", data.message);
    }

    return Promise.reject({
      status,
      message: data.message || "An error occurred",
      errors: data.errors || null,
    });
  } else if (error.request) {
    // Network error
    console.error("Network error:", error.message);
    return Promise.reject({
      status: 0,
      message: "Network error. Please check your connection.",
    });
  } else {
    // Other error
    console.error("Request error:", error.message);
    return Promise.reject({
      status: 0,
      message: error.message,
    });
  }
};

// Apply interceptors
publicApi.interceptors.response.use(responseInterceptor, errorInterceptor);
protectedApi.interceptors.response.use(responseInterceptor, errorInterceptor);

// Public API functions
export const fetchPublicApi = {
  // GET request
  get: (url, config = {}) => publicApi.get(url, config),

  // POST request
  post: (url, data = {}, config = {}) => publicApi.post(url, data, config),

  // PUT request
  put: (url, data = {}, config = {}) => publicApi.put(url, data, config),

  // DELETE request
  delete: (url, config = {}) => publicApi.delete(url, config),

  // PATCH request
  patch: (url, data = {}, config = {}) => publicApi.patch(url, data, config),
};

// Protected API functions
export const fetchProtectedApi = {
  // GET request
  get: (url, config = {}) => protectedApi.get(url, config),

  // POST request
  post: (url, data = {}, config = {}) => protectedApi.post(url, data, config),

  // PUT request
  put: (url, data = {}, config = {}) => protectedApi.put(url, data, config),

  // DELETE request
  delete: (url, config = {}) => protectedApi.delete(url, config),

  // PATCH request
  patch: (url, data = {}, config = {}) => protectedApi.patch(url, data, config),
};

// Export axios instances for direct use if needed
export { publicApi, protectedApi };

// API endpoints constants
export const API_ENDPOINTS = {
  // Auth
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  REFRESH_TOKEN: "/auth/refresh",
  LOGOUT: "/auth/logout",

  // Products
  PRODUCTS: "/products",
  PRODUCT_BY_ID: (id) => `/products/${id}`,

  // Inventory
  INVENTORY: "/inventory",
  INVENTORY_BY_ID: (id) => `/inventory/${id}`,
  IMPORT_INVENTORY: "/inventory/import",
  EXPORT_INVENTORY: "/inventory/export",

  // Sales
  INVOICES: "/invoices",
  INVOICE_BY_ID: (id) => `/invoices/${id}`,
  CREATE_INVOICE: "/invoices",

  // Customers
  CUSTOMERS: "/customers",
  CUSTOMER_BY_ID: (id) => `/customers/${id}`,

  // Reports
  SALES_REPORT: "/reports/sales",
  INVENTORY_REPORT: "/reports/inventory",
  CUSTOMER_REPORT: "/reports/customers",
};
