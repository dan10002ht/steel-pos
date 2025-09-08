/**
 * Helper functions for status display
 */

/**
 * Get color scheme for invoice status
 * @param {string} status - Invoice status
 * @returns {string} Chakra UI color scheme
 */
export const getInvoiceStatusColor = (status) => {
  switch (status) {
    case "confirmed":
      return "green";
    case "draft":
      return "yellow";
    case "cancelled":
      return "red";
    default:
      return "gray";
  }
};

/**
 * Get display text for invoice status
 * @param {string} status - Invoice status
 * @returns {string} Vietnamese status text
 */
export const getInvoiceStatusText = (status) => {
  switch (status) {
    case "confirmed":
      return "Đã xác nhận";
    case "draft":
      return "Nháp";
    case "cancelled":
      return "Đã hủy";
    default:
      return "Không xác định";
  }
};

/**
 * Get color scheme for payment status
 * @param {string} status - Payment status
 * @returns {string} Chakra UI color scheme
 */
export const getPaymentStatusColor = (status) => {
  switch (status) {
    case "paid":
      return "green";
    case "pending":
      return "yellow";
    case "partial":
      return "orange";
    case "refunded":
      return "purple";
    default:
      return "gray";
  }
};

/**
 * Get display text for payment status
 * @param {string} status - Payment status
 * @returns {string} Vietnamese status text
 */
export const getPaymentStatusText = (status) => {
  switch (status) {
    case "paid":
      return "Đã thanh toán";
    case "pending":
      return "Chờ thanh toán";
    case "partial":
      return "Thanh toán một phần";
    case "refunded":
      return "Đã hoàn tiền";
    default:
      return "Không xác định";
  }
};

/**
 * Get payment status text with remaining amount for partial payments
 * @param {Object} invoice - Invoice object
 * @returns {string} Payment status text with remaining amount if partial
 */
export const getPaymentStatusWithRemaining = (invoice) => {
  if (invoice.payment_status === "partial") {
    const remaining = invoice.total_amount - invoice.paid_amount;
    return `Còn lại: ${remaining.toLocaleString("vi-VN")} VNĐ`;
  }
  return getPaymentStatusText(invoice.payment_status);
};
