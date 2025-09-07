/**
 * Constants and options for the application
 */

// Payment Methods
export const PAYMENT_METHODS = [
  { value: "cash", label: "Tiền mặt" },
  { value: "bank_transfer", label: "Chuyển khoản" },
  { value: "credit_card", label: "Thẻ tín dụng" },
  { value: "debit_card", label: "Thẻ ghi nợ" },
  { value: "other", label: "Khác" },
];

// Order Status Options
export const ORDER_STATUS_OPTIONS = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "pending", label: "Chờ duyệt" },
  { value: "approved", label: "Đã duyệt" },
  { value: "rejected", label: "Từ chối" },
  { value: "completed", label: "Hoàn thành" },
];

// Order Status Colors
export const ORDER_STATUS_COLORS = {
  pending: "orange",
  approved: "green", 
  rejected: "red",
  completed: "blue",
};

// Order Status Labels
export const ORDER_STATUS_LABELS = {
  pending: "Chờ duyệt",
  approved: "Đã duyệt",
  rejected: "Từ chối", 
  completed: "Hoàn thành",
};

// Product Status Options
export const PRODUCT_STATUS_OPTIONS = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "active", label: "Hoạt động" },
  { value: "inactive", label: "Không hoạt động" },
];

// Product Status Colors
export const PRODUCT_STATUS_COLORS = {
  active: "green",
  inactive: "red",
};

// Product Status Labels
export const PRODUCT_STATUS_LABELS = {
  active: "Hoạt động",
  inactive: "Không hoạt động",
};

// Page Size Options
export const PAGE_SIZE_OPTIONS = [
  { value: 10, label: "10" },
  { value: 20, label: "20" },
  { value: 50, label: "50" },
  { value: 100, label: "100" },
];

// Default Page Size
export const DEFAULT_PAGE_SIZE = 20;

// User Roles
export const USER_ROLES = {
  ADMIN: "admin",
  MANAGER: "manager", 
  ACCOUNTANT: "accountant",
  USER: "user",
};

// User Role Labels
export const USER_ROLE_LABELS = {
  admin: "Quản trị viên",
  manager: "Quản lý",
  accountant: "Kế toán", 
  user: "Người dùng",
};

// User Role Colors
export const USER_ROLE_COLORS = {
  admin: "purple",
  manager: "blue",
  accountant: "green",
  user: "gray",
};

// Invoice Status Options
export const INVOICE_STATUS_OPTIONS = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "draft", label: "Nháp" },
  { value: "pending", label: "Chờ xử lý" },
  { value: "completed", label: "Hoàn thành" },
  { value: "cancelled", label: "Đã hủy" },
];

// Invoice Status Colors
export const INVOICE_STATUS_COLORS = {
  draft: "gray",
  pending: "orange",
  completed: "green",
  cancelled: "red",
};

// Invoice Status Labels
export const INVOICE_STATUS_LABELS = {
  draft: "Nháp",
  pending: "Chờ xử lý",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
};

// Stock Status Options
export const STOCK_STATUS_OPTIONS = [
  { value: "", label: "Tất cả" },
  { value: "in_stock", label: "Còn hàng" },
  { value: "low_stock", label: "Sắp hết hàng" },
  { value: "out_of_stock", label: "Hết hàng" },
];

// Stock Status Colors
export const STOCK_STATUS_COLORS = {
  in_stock: "green",
  low_stock: "orange", 
  out_of_stock: "red",
};

// Stock Status Labels
export const STOCK_STATUS_LABELS = {
  in_stock: "Còn hàng",
  low_stock: "Sắp hết hàng",
  out_of_stock: "Hết hàng",
};

// Date Range Options
export const DATE_RANGE_OPTIONS = [
  { value: "today", label: "Hôm nay" },
  { value: "yesterday", label: "Hôm qua" },
  { value: "this_week", label: "Tuần này" },
  { value: "last_week", label: "Tuần trước" },
  { value: "this_month", label: "Tháng này" },
  { value: "last_month", label: "Tháng trước" },
  { value: "this_year", label: "Năm nay" },
  { value: "last_year", label: "Năm trước" },
  { value: "custom", label: "Tùy chọn" },
];

// Currency Options
export const CURRENCY_OPTIONS = [
  { value: "VND", label: "Việt Nam Đồng (₫)" },
  { value: "USD", label: "US Dollar ($)" },
  { value: "EUR", label: "Euro (€)" },
];

// Default Currency
export const DEFAULT_CURRENCY = "VND";

// Toast Duration
export const TOAST_DURATION = {
  SHORT: 2000,
  MEDIUM: 3000,
  LONG: 5000,
};

// API Timeouts
export const API_TIMEOUTS = {
  SHORT: 5000,
  MEDIUM: 10000,
  LONG: 30000,
};

// Search Debounce Delay
export const SEARCH_DEBOUNCE_DELAY = 300;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
};

// File Upload
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ["image/jpeg", "image/png", "image/gif", "application/pdf"],
  ALLOWED_EXTENSIONS: [".jpg", ".jpeg", ".png", ".gif", ".pdf"],
};

// Validation Rules
export const VALIDATION_RULES = {
  MIN_PASSWORD_LENGTH: 6,
  MAX_PASSWORD_LENGTH: 128,
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 100,
  MIN_DESCRIPTION_LENGTH: 10,
  MAX_DESCRIPTION_LENGTH: 1000,
};
