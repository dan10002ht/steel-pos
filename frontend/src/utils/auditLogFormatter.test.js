/**
 * Test cases for audit log formatter
 * This file demonstrates how the generateLog function works with different audit log data
 */

import { generateLog, generateDetailedLog, generateLogForDisplay } from './auditLogFormatter';

// Sample audit log data for testing
const sampleAuditLogs = {
  // Invoice creation
  invoiceCreated: {
    id: 1,
    entityType: 'invoice',
    entityId: 123,
    action: 'created',
    userName: 'AdminA',
    createdAt: '2024-01-15T10:30:00Z',
    newData: {
      invoice_code: 'KP-2024-001',
      total_amount: 1500000,
      customer_name: 'Nguyễn Văn A'
    }
  },

  // Invoice payment
  invoicePayment: {
    id: 2,
    entityType: 'invoice',
    entityId: 123,
    action: 'payment_created',
    userName: 'AdminA',
    createdAt: '2024-01-15T11:00:00Z',
    newData: {
      amount: 1500000,
      payment_method: 'cash',
      invoice_code: 'KP-2024-001'
    }
  },

  // Invoice cancellation
  invoiceCancelled: {
    id: 3,
    entityType: 'invoice',
    entityId: 124,
    action: 'cancelled',
    userName: 'AdminB',
    createdAt: '2024-01-15T12:00:00Z',
    newData: {
      cancellation_reason: 'Khách hàng yêu cầu hủy',
      invoice_code: 'KP-2024-002'
    }
  },

  // Customer creation
  customerCreated: {
    id: 4,
    entityType: 'customer',
    entityId: 456,
    action: 'created',
    userName: 'AdminA',
    createdAt: '2024-01-15T09:00:00Z',
    newData: {
      customer_name: 'Trần Thị B',
      phone: '0123456789'
    }
  },

  // Product creation
  productCreated: {
    id: 5,
    entityType: 'product',
    entityId: 789,
    action: 'created',
    userName: 'AdminA',
    createdAt: '2024-01-15T08:00:00Z',
    newData: {
      product_name: 'Thép tấm 3mm',
      sku: 'ST-001'
    }
  },

  // Product variant stock restoration
  productVariantRestored: {
    id: 6,
    entityType: 'product_variant',
    entityId: 101,
    action: 'cancellation',
    userName: 'AdminB',
    createdAt: '2024-01-15T14:00:00Z',
    newData: {
      variant_name: 'Thép tấm 3mm - 1000x2000mm',
      quantity_change: 10
    }
  },

  // Import order completion
  importOrderCompleted: {
    id: 7,
    entityType: 'import_order',
    entityId: 201,
    action: 'completed',
    userName: 'AdminA',
    createdAt: '2024-01-15T16:00:00Z',
    newData: {
      import_code: 'IMP-2024-001',
      total_amount: 50000000
    }
  },

  // System action (no user)
  systemAction: {
    id: 8,
    entityType: 'invoice',
    entityId: 125,
    action: 'updated',
    userName: null,
    createdAt: '2024-01-15T17:00:00Z',
    newData: {
      invoice_code: 'KP-2024-003',
      status: 'paid'
    }
  }
};

// Test function to demonstrate all cases
export const testAuditLogFormatter = () => {
  console.log('=== AUDIT LOG FORMATTER TEST RESULTS ===\n');

  Object.entries(sampleAuditLogs).forEach(([key, auditLog]) => {
    console.log(`Test Case: ${key}`);
    console.log(`Input:`, auditLog);
    console.log(`Output:`, generateLog(auditLog));
    console.log(`Detailed:`, generateDetailedLog(auditLog, true));
    console.log(`Display:`, generateLogForDisplay(auditLog, { maxLength: 80 }));
    console.log('---\n');
  });
};

// Expected outputs for verification
export const expectedOutputs = {
  invoiceCreated: 'AdminA tạo hoá đơn "KP-2024-001" vào 15/01/2024, 17:30:00',
  invoicePayment: 'AdminA thanh toán 1.500.000 ₫ bằng tiền mặt cho hoá đơn "KP-2024-001" vào 15/01/2024, 18:00:00',
  invoiceCancelled: 'AdminB hủy hoá đơn "KP-2024-002" (Lý do: Khách hàng yêu cầu hủy) vào 15/01/2024, 19:00:00',
  customerCreated: 'AdminA tạo khách hàng "Trần Thị B" vào 15/01/2024, 16:00:00',
  productCreated: 'AdminA tạo sản phẩm "Thép tấm 3mm" vào 15/01/2024, 15:00:00',
  productVariantRestored: 'AdminB khôi phục tồn kho cho biến thể sản phẩm "Thép tấm 3mm - 1000x2000mm" vào 15/01/2024, 21:00:00',
  importOrderCompleted: 'AdminA hoàn thành đơn nhập hàng "IMP-2024-001" vào 15/01/2024, 23:00:00',
  systemAction: 'Hệ thống cập nhật hoá đơn "KP-2024-003" vào 15/01/2024, 00:00:00'
};

export default sampleAuditLogs;
