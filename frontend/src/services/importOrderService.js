import api from '../shared/services/api';

const BASE_URL = '/api/import-orders';

export const importOrderService = {
  // Get all import orders with pagination and filters
  async getAllImportOrders(params = {}) {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.status) queryParams.append('status', params.status);
    if (params.supplierName)
      queryParams.append('supplier_name', params.supplierName);
    if (params.search) queryParams.append('search', params.search);

    const url = `${BASE_URL}?${queryParams.toString()}`;
    const response = await api.get(url);
    return response.data;
  },

  // Get import order by ID
  async getImportOrderById(id) {
    const response = await api.get(`${BASE_URL}/${id}`);
    return response.data;
  },

  // Create new import order
  async createImportOrder(orderData) {
    const response = await api.post(BASE_URL, orderData);
    return response.data;
  },

  // Update import order
  async updateImportOrder(id, orderData) {
    const response = await api.put(`${BASE_URL}/${id}`, orderData);
    return response.data;
  },

  // Approve import order
  async approveImportOrder(id, approvalData) {
    const response = await api.post(`${BASE_URL}/${id}/approve`, approvalData);
    return response.data;
  },

  // Delete import order
  async deleteImportOrder(id) {
    const response = await api.delete(`${BASE_URL}/${id}`);
    return response.data;
  },

  // Transform backend data to frontend format
  transformBackendToFrontend(backendOrder) {
    return {
      id: backendOrder.id,
      importCode: backendOrder.import_code,
      supplier: backendOrder.supplier_name,
      importDate: backendOrder.import_date,
      totalValue: backendOrder.total_amount,
      productCount: backendOrder.items?.length || 0,
      status: backendOrder.status,
      notes: backendOrder.notes,
      importImages: backendOrder.import_images || [],
      approvedBy: backendOrder.approved_by,
      approvedAt: backendOrder.approved_at,
      approvalNote: backendOrder.approval_note,
      createdAt: backendOrder.created_at,
      updatedAt: backendOrder.updated_at,
      products:
        backendOrder.items?.map(item => ({
          name: item.product_name,
          variant: item.variant_name,
          quantity: item.quantity,
          unit: item.unit,
          unitPrice: item.unit_price,
          total: item.total_price,
        })) || [],
    };
  },

  // Transform frontend data to backend format
  transformFrontendToBackend(frontendOrder) {
    // Convert date string (YYYY-MM-DD) to ISO 8601 format
    let importDate = frontendOrder.importDate;
    if (importDate && typeof importDate === 'string') {
      // If it's already in ISO format, use as is
      if (importDate.includes('T')) {
        // Already in ISO format
      } else {
        // Convert YYYY-MM-DD to ISO format with timezone
        const date = new Date(importDate);
        importDate = date.toISOString();
      }
    }

    return {
      supplier_name: frontendOrder.supplier,
      import_date: importDate,
      notes: frontendOrder.notes || '',
      import_images: frontendOrder.importImages || [],
      items:
        frontendOrder.products?.map(product => ({
          product_id: product.productId || 1, // Default value, should be selected from dropdown
          variant_id: product.variantId || 1, // Default value, should be selected from dropdown
          product_name: product.name,
          variant_name: product.variant,
          quantity: product.quantity,
          unit_price: product.unitPrice,
          unit: product.unit,
          notes: product.notes || '',
        })) || [],
    };
  },
};
