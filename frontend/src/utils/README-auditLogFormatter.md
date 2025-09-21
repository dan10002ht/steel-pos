# Audit Log Formatter

Utility functions để format audit logs thành text dễ đọc cho người dùng.

## Cách sử dụng

### 1. Import functions

```javascript
import { generateLog, generateDetailedLog, generateLogForDisplay } from '@/utils/auditLogFormatter';
```

### 2. Sử dụng cơ bản

```javascript
const auditLog = {
  entityType: 'invoice',
  entityId: 123,
  action: 'created',
  userName: 'AdminA',
  createdAt: '2024-01-15T10:30:00Z',
  newData: {
    invoice_code: 'INV-2024-001'
  }
};

const logText = generateLog(auditLog);
// Output: "AdminA tạo hoá đơn "INV-2024-001" vào 15/01/2024, 17:30:00"
```

### 3. Sử dụng với component

```jsx
import AuditLogText from '@/components/atoms/AuditLogText/AuditLogText';

<AuditLogText 
  auditLog={auditLog} 
  variant="simple" 
  maxLength={100}
  showTooltip={true}
/>
```

## Các loại format

### 1. `generateLog(auditLog)`
Format cơ bản, trả về string đơn giản.

### 2. `generateDetailedLog(auditLog, includeDetails)`
Format chi tiết, có thể bao gồm thông tin thay đổi.

### 3. `generateLogForDisplay(auditLog, options)`
Format cho hiển thị UI, trả về object với metadata.

## Các entity types được hỗ trợ

- `invoice` - Hoá đơn
- `customer` - Khách hàng  
- `product` - Sản phẩm
- `product_variant` - Biến thể sản phẩm
- `import_order` - Đơn nhập hàng
- `user` - Người dùng
- `category` - Danh mục
- `supplier` - Nhà cung cấp

## Các actions được hỗ trợ

- `created` - Tạo
- `updated` - Cập nhật
- `deleted` - Xóa
- `cancelled` - Hủy
- `payment_created` - Thêm thanh toán
- `payment_updated` - Cập nhật thanh toán
- `payment_deleted` - Xóa thanh toán
- `restored` - Khôi phục
- `cancellation` - Khôi phục tồn kho

## Ví dụ output

### Tạo hoá đơn
```
AdminA tạo hoá đơn "INV-2024-001" vào 15/01/2024, 17:30:00
```

### Thanh toán
```
AdminA thanh toán 1.500.000 ₫ bằng tiền mặt cho hoá đơn "INV-2024-001" vào 15/01/2024, 18:00:00
```

### Hủy hoá đơn
```
AdminB hủy hoá đơn "INV-2024-002" (Lý do: Khách hàng yêu cầu hủy) vào 15/01/2024, 19:00:00
```

### Tạo khách hàng
```
AdminA tạo khách hàng "Trần Thị B" vào 15/01/2024, 16:00:00
```

### Khôi phục tồn kho
```
AdminB khôi phục tồn kho cho biến thể sản phẩm "Thép tấm 3mm - 1000x2000mm" vào 15/01/2024, 21:00:00
```

## Tùy chỉnh

### Payment methods
```javascript
const PAYMENT_METHODS = {
  cash: 'tiền mặt',
  card: 'thẻ',
  bank_transfer: 'chuyển khoản',
  credit: 'ghi nợ',
  e_wallet: 'ví điện tử'
};
```

### Entity types
```javascript
const ENTITY_TYPES = {
  invoice: 'hoá đơn',
  customer: 'khách hàng',
  product: 'sản phẩm',
  // ...
};
```

## Test

Chạy test để xem các ví dụ:

```javascript
import { testAuditLogFormatter } from '@/utils/auditLogFormatter.test';

testAuditLogFormatter();
```
