/**
 * Utility functions for formatting audit logs into human-readable text
 */

// Entity type mappings
const ENTITY_TYPES = {
  invoice: 'hoá đơn',
  customer: 'khách hàng',
  product: 'sản phẩm',
  product_variant: 'biến thể sản phẩm',
  import_order: 'đơn nhập hàng',
  user: 'người dùng',
  category: 'danh mục',
  supplier: 'nhà cung cấp',
};

// Action mappings
const ACTION_TYPES = {
  created: 'tạo',
  updated: 'cập nhật',
  deleted: 'xóa',
  cancelled: 'hủy',
  payment_created: 'thêm thanh toán',
  payment_updated: 'cập nhật thanh toán',
  payment_deleted: 'xóa thanh toán',
  restored: 'khôi phục',
  cancellation: 'khôi phục tồn kho',
};

// Payment method mappings
const PAYMENT_METHODS = {
  cash: 'tiền mặt',
  card: 'thẻ',
  bank_transfer: 'chuyển khoản',
  credit: 'ghi nợ',
  e_wallet: 'ví điện tử',
};

/**
 * Format currency amount
 * @param {number} amount - The amount to format
 * @returns {string} Formatted currency string
 */
const formatCurrency = amount => {
  if (typeof amount !== 'number') return '0 VNĐ';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Format date to Vietnamese format
 * @param {string|Date} date - The date to format
 * @returns {string} Formatted date string
 */
const formatDate = date => {
  if (!date) return '';

  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return '';

  return dateObj.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

/**
 * Get entity name from audit log data
 * @param {Object} auditLog - The audit log object
 * @returns {string} Entity name
 */
const getEntityName = auditLog => {
  const { entityType, newData, oldData } = auditLog;

  // Try to get name from newData first, then oldData
  const data = newData || oldData || {};

  switch (entityType) {
    case 'invoice':
      return data.invoice_code || data.code || `#${auditLog.entityId}`;
    case 'customer':
      return (
        data.customer_name || data.name || `Khách hàng #${auditLog.entityId}`
      );
    case 'product':
      return data.product_name || data.name || `Sản phẩm #${auditLog.entityId}`;
    case 'product_variant':
      return data.variant_name || data.name || `Biến thể #${auditLog.entityId}`;
    case 'import_order':
      return data.import_code || data.code || `Đơn nhập #${auditLog.entityId}`;
    case 'user':
      return data.username || data.name || `Người dùng #${auditLog.entityId}`;
    default:
      return `${ENTITY_TYPES[entityType] || entityType} #${auditLog.entityId}`;
  }
};

/**
 * Generate human-readable log text from audit log
 * @param {Object} auditLog - The audit log object
 * @returns {string} Formatted log text
 */
export const generateLog = auditLog => {
  if (!auditLog) return '';
  console.log(auditLog);

  const {
    entity_type: entityType,
    action,
    user_name: userName,
    created_at: createdAt,
    new_data,
    old_data,
    created_by_name: createdByName,
  } = auditLog;

  // Get user name
  const user = userName || 'Hệ thống';

  // Format date
  const date = formatDate(createdAt);

  // Get entity name
  const entityName = getEntityName(auditLog);

  // Get action text
  const actionText = ACTION_TYPES[action] || action;

  // Handle special cases
  switch (entityType) {
    case 'invoice':
      return generateInvoiceLog(auditLog, user, date, entityName, actionText);

    case 'customer':
      return generateCustomerLog(auditLog, user, date, entityName, actionText);

    case 'product':
    case 'product_variant':
      return generateProductLog(auditLog, user, date, entityName, actionText);

    case 'import_order':
      return generateImportOrderLog(
        auditLog,
        user,
        date,
        entityName,
        actionText
      );

    default:
      return `${user} ${actionText} ${ENTITY_TYPES[entityType] || entityType} "${entityName}" vào ${date}`;
  }
};

/**
 * Generate invoice-specific log text
 */
const generateInvoiceLog = (auditLog, user, date, entityName, actionText) => {
  const { action, newData, oldData } = auditLog;

  switch (action) {
    case 'created':
      return `${user} tạo hoá đơn "${entityName}" vào ${date}`;

    case 'updated':
      return `${user} cập nhật hoá đơn "${entityName}" vào ${date}`;

    case 'cancelled':
      const reason =
        newData?.cancellation_reason || oldData?.cancellation_reason;
      return reason
        ? `${user} hủy hoá đơn "${entityName}" (Lý do: ${reason}) vào ${date}`
        : `${user} hủy hoá đơn "${entityName}" vào ${date}`;

    case 'payment_created':
      if (newData) {
        const amount = formatCurrency(newData.amount || 0);
        const method =
          PAYMENT_METHODS[newData.payment_method] ||
          newData.payment_method ||
          'không xác định';
        return `${user} thanh toán ${amount} bằng ${method} cho hoá đơn "${entityName}" vào ${date}`;
      }
      return `${user} thêm thanh toán cho hoá đơn "${entityName}" vào ${date}`;

    case 'payment_updated':
      return `${user} cập nhật thanh toán cho hoá đơn "${entityName}" vào ${date}`;

    case 'payment_deleted':
      return `${user} xóa thanh toán cho hoá đơn "${entityName}" vào ${date}`;

    default:
      return `${user} ${actionText} hoá đơn "${entityName}" vào ${date}`;
  }
};

/**
 * Generate customer-specific log text
 */
const generateCustomerLog = (auditLog, user, date, entityName, actionText) => {
  const { action } = auditLog;

  switch (action) {
    case 'created':
      return `${user} tạo khách hàng "${entityName}" vào ${date}`;

    case 'updated':
      return `${user} cập nhật thông tin khách hàng "${entityName}" vào ${date}`;

    case 'deleted':
      return `${user} xóa khách hàng "${entityName}" vào ${date}`;

    default:
      return `${user} ${actionText} khách hàng "${entityName}" vào ${date}`;
  }
};

/**
 * Generate product-specific log text
 */
const generateProductLog = (auditLog, user, date, entityName, actionText) => {
  const { entityType, action, newData, oldData } = auditLog;
  const entityTypeText =
    entityType === 'product_variant' ? 'biến thể sản phẩm' : 'sản phẩm';

  switch (action) {
    case 'created':
      return `${user} tạo ${entityTypeText} "${entityName}" vào ${date}`;

    case 'updated':
      return `${user} cập nhật ${entityTypeText} "${entityName}" vào ${date}`;

    case 'deleted':
      return `${user} xóa ${entityTypeText} "${entityName}" vào ${date}`;

    case 'cancellation':
      return `${user} khôi phục tồn kho cho ${entityTypeText} "${entityName}" vào ${date}`;

    default:
      return `${user} ${actionText} ${entityTypeText} "${entityName}" vào ${date}`;
  }
};

/**
 * Generate import order-specific log text
 */
const generateImportOrderLog = (
  auditLog,
  user,
  date,
  entityName,
  actionText
) => {
  const { action } = auditLog;

  switch (action) {
    case 'created':
      return `${user} tạo đơn nhập hàng "${entityName}" vào ${date}`;

    case 'updated':
      return `${user} cập nhật đơn nhập hàng "${entityName}" vào ${date}`;

    case 'deleted':
      return `${user} xóa đơn nhập hàng "${entityName}" vào ${date}`;

    case 'completed':
      return `${user} hoàn thành đơn nhập hàng "${entityName}" vào ${date}`;

    default:
      return `${user} ${actionText} đơn nhập hàng "${entityName}" vào ${date}`;
  }
};

/**
 * Generate log with additional details from changes summary
 * @param {Object} auditLog - The audit log object
 * @param {boolean} includeDetails - Whether to include change details
 * @returns {string} Formatted log text with details
 */
export const generateDetailedLog = (auditLog, includeDetails = false) => {
  const baseLog = generateLog(auditLog);

  if (!includeDetails || !auditLog.changesSummary) {
    return baseLog;
  }

  return `${baseLog} (${auditLog.changesSummary})`;
};

/**
 * Generate log for display in UI components
 * @param {Object} auditLog - The audit log object
 * @param {Object} options - Display options
 * @returns {Object} Formatted log object with text and metadata
 */
export const generateLogForDisplay = (auditLog, options = {}) => {
  const {
    includeDetails = false,
    maxLength = 100,
    showTimestamp = true,
  } = options;

  const logText = includeDetails
    ? generateDetailedLog(auditLog, true)
    : generateLog(auditLog);

  const truncatedText =
    logText.length > maxLength
      ? `${logText.substring(0, maxLength)}...`
      : logText;

  return {
    text: truncatedText,
    fullText: logText,
    timestamp: auditLog.createdAt,
    user: auditLog.userName || 'Hệ thống',
    action: auditLog.action,
    entityType: auditLog.entityType,
    entityId: auditLog.entityId,
    isTruncated: logText.length > maxLength,
  };
};

export default {
  generateLog,
  generateDetailedLog,
  generateLogForDisplay,
  formatCurrency,
  formatDate,
};
