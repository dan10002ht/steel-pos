# Audit Log Components Usage Guide

## Các component đã được cập nhật

### 1. **InvoiceAuditLog** (Updated)
Component hiển thị audit log cho invoice với format mới.

```jsx
import InvoiceAuditLog from '@/components/molecules/sales/InvoiceAuditLog/InvoiceAuditLog';

<InvoiceAuditLog 
  invoiceId={123}
  auditLogs={auditLogs}
  showDetailedLog={false} // Optional: hiển thị detailed log
/>
```

### 2. **AuditLogList** (New)
Component generic để hiển thị audit log cho bất kỳ entity nào.

```jsx
import AuditLogList from '@/components/molecules/audit/AuditLogList/AuditLogList';

<AuditLogList 
  auditLogs={auditLogs}
  title="Lịch sử hoạt động"
  showDetailedLog={false}
  showFilters={true}
  onRefresh={handleRefresh}
  isLoading={false}
  maxHeight="400px"
/>
```

### 3. **AuditLogText** (New)
Component để hiển thị formatted audit log text.

```jsx
import AuditLogText from '@/components/atoms/AuditLogText/AuditLogText';

<AuditLogText 
  auditLog={auditLog}
  variant="simple" // "simple", "detailed", "display"
  maxLength={100}
  showTooltip={true}
/>
```

## Hooks mới

### 1. **useEntityAuditLogs**
Lấy audit logs cho một entity cụ thể.

```jsx
import { useEntityAuditLogs } from '@/hooks/useAuditLogs';

const { data: auditLogs, isLoading, error } = useEntityAuditLogs(
  'customer', // entityType
  123,        // entityId
  { enabled: true }
);
```

### 2. **useAuditLogsWithFilter**
Lấy audit logs với filter.

```jsx
import { useAuditLogsWithFilter } from '@/hooks/useAuditLogs';

const { data: auditLogs, isLoading, error } = useAuditLogsWithFilter({
  entityType: 'invoice',
  action: 'created',
  dateFrom: '2024-01-01',
  dateTo: '2024-01-31',
  page: 1,
  limit: 20
});
```

### 3. **useRecentAuditLogs**
Lấy audit logs gần đây (cho dashboard).

```jsx
import { useRecentAuditLogs } from '@/hooks/useAuditLogs';

const { data: recentLogs, isLoading, error } = useRecentAuditLogs(10);
```

### 4. **useUserAuditLogs**
Lấy audit logs của user cụ thể.

```jsx
import { useUserAuditLogs } from '@/hooks/useAuditLogs';

const { data: userLogs, isLoading, error } = useUserAuditLogs(userId);
```

## Ví dụ sử dụng

### 1. **Trong Customer Detail Page**

```jsx
import React from 'react';
import { useEntityAuditLogs } from '@/hooks/useAuditLogs';
import AuditLogList from '@/components/molecules/audit/AuditLogList/AuditLogList';

const CustomerDetailPage = ({ customerId }) => {
  const { data: auditLogs, isLoading, refetch } = useEntityAuditLogs(
    'customer',
    customerId
  );

  return (
    <div>
      {/* Customer info */}
      
      <AuditLogList 
        auditLogs={auditLogs || []}
        title="Lịch sử khách hàng"
        onRefresh={refetch}
        isLoading={isLoading}
      />
    </div>
  );
};
```

### 2. **Trong Dashboard**

```jsx
import React from 'react';
import { useRecentAuditLogs } from '@/hooks/useAuditLogs';
import AuditLogList from '@/components/molecules/audit/AuditLogList/AuditLogList';

const Dashboard = () => {
  const { data: recentLogs, isLoading, refetch } = useRecentAuditLogs(15);

  return (
    <div>
      {/* Other dashboard components */}
      
      <AuditLogList 
        auditLogs={recentLogs || []}
        title="Hoạt động gần đây"
        onRefresh={refetch}
        isLoading={isLoading}
        maxHeight="300px"
      />
    </div>
  );
};
```

### 3. **Trong Product Detail Page**

```jsx
import React from 'react';
import { useEntityAuditLogs } from '@/hooks/useAuditLogs';
import AuditLogList from '@/components/molecules/audit/AuditLogList/AuditLogList';

const ProductDetailPage = ({ productId }) => {
  const { data: auditLogs, isLoading, refetch } = useEntityAuditLogs(
    'product',
    productId
  );

  return (
    <div>
      {/* Product info */}
      
      <AuditLogList 
        auditLogs={auditLogs || []}
        title="Lịch sử sản phẩm"
        showDetailedLog={true}
        onRefresh={refetch}
        isLoading={isLoading}
      />
    </div>
  );
};
```

### 4. **Custom Audit Log Display**

```jsx
import React from 'react';
import { useAuditLogsWithFilter } from '@/hooks/useAuditLogs';
import AuditLogText from '@/components/atoms/AuditLogText/AuditLogText';

const CustomAuditLogPage = () => {
  const { data: auditLogs, isLoading } = useAuditLogsWithFilter({
    entityType: 'invoice',
    action: 'payment_created',
    dateFrom: '2024-01-01',
    dateTo: '2024-01-31'
  });

  return (
    <div>
      {auditLogs?.map(log => (
        <div key={log.id}>
          <AuditLogText 
            auditLog={log}
            variant="detailed"
            maxLength={150}
            showTooltip={true}
          />
        </div>
      ))}
    </div>
  );
};
```

## Format mới vs Format cũ

### ❌ **Format cũ:**
```
AdminA - Tạo mới - 15/01/2024, 17:30:00
```

### ✅ **Format mới:**
```
AdminA tạo hoá đơn "INV-2024-001" vào 15/01/2024, 17:30:00
AdminA thanh toán 1.500.000 ₫ bằng tiền mặt cho hoá đơn "INV-2024-001" vào 15/01/2024, 18:00:00
AdminB hủy hoá đơn "INV-2024-002" (Lý do: Khách hàng yêu cầu hủy) vào 15/01/2024, 19:00:00
```

## Benefits

1. **Human-readable** - Dễ đọc và hiểu hơn
2. **Consistent** - Format nhất quán across toàn bộ app
3. **Detailed** - Có thể hiển thị chi tiết khi cần
4. **Flexible** - Có thể customize theo nhu cầu
5. **Reusable** - Có thể dùng cho nhiều entity types
6. **Localized** - Hỗ trợ tiếng Việt





