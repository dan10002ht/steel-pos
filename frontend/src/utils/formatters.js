/**
 * Utility functions for formatting data
 */

/**
 * Format currency to Vietnamese Dong (VND)
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: VND)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = "VND") => {
  if (amount === null || amount === undefined) return "N/A";
  
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: currency,
  }).format(amount);
};

/**
 * Format price to Vietnamese Dong (VND) without currency symbol
 * @param {number} amount - Amount to format
 * @returns {string} Formatted price string
 */
export const formatPrice = (amount) => {
  if (amount === null || amount === undefined) return "N/A";
  
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

/**
 * Format number with thousand separators
 * @param {number} number - Number to format
 * @returns {string} Formatted number string
 */
export const formatNumber = (number) => {
  if (number === null || number === undefined) return "0";
  
  return new Intl.NumberFormat("vi-VN").format(number);
};

/**
 * Format date to Vietnamese locale
 * @param {string|Date} date - Date to format
 * @param {string} options - Date format options
 * @returns {string} Formatted date string
 */
export const formatDate = (date, options = {}) => {
  if (!date) return "N/A";
  
  const defaultOptions = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    ...options,
  };
  
  return new Intl.DateTimeFormat("vi-VN", defaultOptions).format(new Date(date));
};

/**
 * Format datetime to Vietnamese locale
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted datetime string
 */
export const formatDateTime = (date) => {
  if (!date) return "N/A";
  
  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
};

/**
 * Format file size in bytes to human readable format
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted file size string
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  
  return text.substring(0, maxLength) + "...";
};

/**
 * Capitalize first letter of each word
 * @param {string} text - Text to capitalize
 * @returns {string} Capitalized text
 */
export const capitalizeWords = (text) => {
  if (!text) return "";
  
  return text
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

/**
 * Format phone number to Vietnamese format
 * @param {string} phone - Phone number
 * @returns {string} Formatted phone number
 */
export const formatPhoneNumber = (phone) => {
  if (!phone) return "";
  
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, "");
  
  // Format based on length
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, "$1 $2 $3");
  } else if (cleaned.length === 11) {
    return cleaned.replace(/(\d{4})(\d{3})(\d{4})/, "$1 $2 $3");
  }
  
  return phone;
};
