/**
 * Generate a default invoice object with the specified code
 * @param {string} code - The code for the invoice (e.g., "1", "2", "3")
 * @returns {Object} Default invoice object
 */
export const generateDefaultInvoice = (code) => {
  return {
    id: Date.now() + Math.random(), // Ensure unique ID
    code: `Hoá đơn ${code}`,
    items: [],
    customer_id: null,
    customer_name: "",
    customer_phone: "",
    customer_address: "",
    notes: "",
    discount: 0,
    paymentMethod: "",
    paidAmount: 0,
  };
};

/**
 * Generate multiple default invoices
 * @param {number} count - Number of invoices to generate
 * @returns {Array} Array of default invoice objects
 */
export const generateMultipleDefaultInvoices = (count) => {
  return Array.from({ length: count }, (_, index) => 
    generateDefaultInvoice(index + 1)
  );
};
