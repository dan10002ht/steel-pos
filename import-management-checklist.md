# Checklist - Quản lý nhập hàng

## 1. Tạo đơn nhập hàng (Create Import Order)

### 1.1 Layout và UI Components

- [x] **Header Section**
  - [x] Heading "Tạo mới nhập kho" ở phía trên bên trái
  - [x] Button "Tạo đơn nhập hàng" ở phía trên bên phải
  - [x] Responsive design cho mobile/tablet

### 1.2 Form Fields - Thông tin đơn nhập hàng

- [x] **Mã nhập kho (Import Code)**

  - [x] Auto-generate mã nhập kho (format: 0001, 0002, ...)
  - [x] Display field (read-only)
  - [x] Validation: Required

- [x] **Nhà cung cấp (Supplier)**

  - [x] Input field với label "Nhà cung cấp \*"
  - [x] Validation: Required
  - [x] Error message: "Không được bỏ trống nhà cung cấp"
  - [x] Auto-complete/Search functionality

- [x] **Ngày nhập kho (Import Date)**

  - [x] Date picker component
  - [x] Label: "Ngày nhập kho \*"
  - [x] Validation: Required
  - [x] Error message: "Không được bỏ trống ngày nhập kho"
  - [x] Default: Current date

- [x] **Chứng từ kèm theo (Attached Documents)**
  - [x] File upload component với "+" button
  - [x] Label: "Chứng từ kèm theo \*"
  - [x] Validation: Required
  - [x] Error message: "Không được bỏ trống chứng từ"
  - [x] Support multiple file types (PDF, JPG, PNG, etc.)
  - [x] File size limit validation
  - [x] Preview uploaded files

### 1.3 Product Management Section

- [x] **Section Header**

  - [x] Title: "Sản phẩm"
  - [x] Button "Thêm sản phẩm" ở góc phải

- [x] **Product Table**

  - [x] Table headers: "Tên sản phẩm", "Số lượng", "Đơn giá", "Thành tiền"
  - [x] Dynamic rows for products
  - [x] Auto-calculate "Thành tiền" = Số lượng × Đơn giá

- [x] **Product Selection (Combobox)**

  - [x] Dropdown "Chọn sản phẩm" cho mỗi row
  - [x] Search functionality trong dropdown
  - [x] Display product name và variants
  - [x] **Create New Product Modal**
    - [x] Button "Tạo mới sản phẩm" trong dropdown
    - [x] Modal popup với form tạo sản phẩm
    - [x] Fields: Tên sản phẩm, Phân loại, Đơn vị, Đơn giá
    - [x] Save và refresh product list

- [x] **Product Variants**

  - [x] Allow selection theo variants (Phi 12, Phi 16, etc.)
  - [x] Display variant info: "Phân loại: Phi 12", "Đơn vị: m"
  - [x] Auto-fill đơn giá theo variant

- [x] **Quantity and Price Fields**
  - [x] Input field cho số lượng
  - [x] Input field cho đơn giá (format: 50,000 đ)
  - [x] Auto-format numbers với thousand separators
  - [x] Validation: Required, Positive numbers

### 1.4 Summary Section

- [x] **Total Calculation**

  - [x] Display "Tổng giá trị: 100,000,000 đ"
  - [x] Auto-calculate tổng từ tất cả products
  - [x] Format với thousand separators và currency symbol

- [x] **Action Buttons**
  - [x] Button "Gửi phê duyệt" (Send for Approval)
  - [x] Button "Lưu nháp" (Save Draft)
  - [x] Button "Hủy" (Cancel)

### 1.5 Validation và Error Handling

- [x] **Form Validation**

  - [x] Required field validation
  - [x] Date format validation
  - [x] Number format validation
  - [x] File upload validation
  - [x] At least one product required

- [x] **Error Messages**
  - [x] Display validation errors below each field
  - [x] Red color for error messages
  - [x] Clear error messages on successful validation

## 2. Data Table - Danh sách nhập kho

### 2.1 Layout

- [x] **Header Section**
  - [x] Heading "Danh sách nhập kho" ở phía trên bên trái
  - [x] Button "Tạo đơn nhập hàng" ở phía trên bên phải
  - [x] Search/Filter controls

### 2.2 Table Columns

- [x] **Nhà cung cấp (Supplier)**

  - [x] Display supplier name
  - [x] Sortable column
  - [x] Searchable

- [x] **Ngày nhập kho (Import Date)**

  - [x] Display date in DD/MM/YYYY format
  - [x] Sortable column
  - [x] Date range filter

- [x] **Tổng giá trị (Total Value)**

  - [x] Display formatted currency (100,000,000 đ)
  - [x] Sortable column
  - [x] Right-aligned

- [x] **Số lượng sản phẩm (Product Count)**

  - [x] Calculate tổng số lượng của tất cả variants
  - [x] Display as number
  - [x] Sortable column
  - [x] Right-aligned

- [x] **Trạng thái (Status)**

  - [x] "Chờ phê duyệt" (Pending Approval)
  - [x] "Đã phê duyệt" (Approved)
  - [x] Color coding: Orange for pending, Green for approved
  - [x] Filterable by status

- [x] **Actions**
  - [x] Button "Phê duyệt" (Approve) - chỉ hiển thị cho status "Chờ phê duyệt"
  - [x] Button "Sửa" (Edit) - icon edit
  - [x] Button "Xóa" (Delete) - icon delete với confirmation dialog
  - [x] Dropdown menu cho actions

### 2.3 Table Features

- [x] **Pagination**

  - [x] Page size selector (10, 25, 50, 100)
  - [x] Page navigation
  - [x] Total records display

- [x] **Sorting**

  - [x] Click column headers to sort
  - [x] Multi-column sorting
  - [x] Sort indicators

- [x] **Filtering**

  - [x] Search box cho tất cả columns
  - [x] Date range picker
  - [x] Status filter dropdown
  - [x] Supplier filter dropdown

- [x] **Export**
  - [x] Export to Excel
  - [x] Export to PDF
  - [x] Print functionality

## 3. Business Logic

### 3.1 Approval Workflow

- [x] **Status Management**
  - [x] Initial status: "Chờ phê duyệt"
  - [x] Kế toán tạo đơn → Status: "Chờ phê duyệt"
  - [x] Quản lý phê duyệt → Status: "Đã phê duyệt"
  - [x] Update inventory sau khi phê duyệt

### 3.2 Inventory Management

- [ ] **Inventory Calculation**
  - [ ] Tồn kho mới = Tồn kho cũ + Số lượng nhập kho
  - [ ] Update inventory theo từng variant
  - [ ] Track inventory history
  - [ ] Prevent negative inventory

### 3.3 Data Validation

- [ ] **Business Rules**
  - [ ] Không cho phép sửa đơn đã phê duyệt
  - [ ] Không cho phép xóa đơn đã phê duyệt
  - [ ] Validate supplier exists
  - [ ] Validate product variants exist

## 4. Technical Implementation

### 4.1 Frontend Components

- [x] **React Components**
  - [x] ImportOrderForm.jsx
  - [x] ImportOrderList.jsx
  - [ ] ProductSelector.jsx
  - [ ] FileUpload.jsx
  - [x] ApprovalModal.jsx
  - [x] ProductCreateModal.jsx
  - [x] Inventory.jsx (tích hợp quản lý nhập hàng)

### 4.2 State Management

- [ ] **Redux/Context**
  - [ ] Import orders state
  - [ ] Products state
  - [ ] Suppliers state
  - [ ] Loading states
  - [ ] Error states

### 4.3 API Integration

- [ ] **Backend APIs**
  - [ ] GET /api/import-orders
  - [ ] POST /api/import-orders
  - [ ] PUT /api/import-orders/:id
  - [ ] DELETE /api/import-orders/:id
  - [ ] POST /api/import-orders/:id/approve
  - [ ] GET /api/products
  - [ ] POST /api/products
  - [ ] GET /api/suppliers

### 4.4 Database Schema

- [ ] **Tables**
  - [ ] import_orders
  - [ ] import_order_items
  - [ ] import_order_documents
  - [ ] products
  - [ ] product_variants
  - [ ] suppliers
  - [ ] inventory

## 5. Testing

### 5.1 Unit Tests

- [ ] Form validation tests
- [ ] Calculation tests
- [ ] Component rendering tests
- [ ] API integration tests

### 5.2 Integration Tests

- [ ] End-to-end workflow tests
- [ ] Approval process tests
- [ ] Inventory update tests

### 5.3 User Acceptance Tests

- [ ] Create import order workflow
- [ ] Approval workflow
- [ ] Data table functionality
- [ ] Mobile responsiveness

## 6. Documentation

### 6.1 User Documentation

- [ ] User manual cho tính năng nhập kho
- [ ] Video tutorials
- [ ] FAQ section

### 6.2 Technical Documentation

- [ ] API documentation
- [ ] Component documentation
- [ ] Database schema documentation
- [ ] Deployment guide

## 7. Performance & Security

### 7.1 Performance

- [ ] Lazy loading cho large datasets
- [ ] Pagination optimization
- [ ] Image compression cho uploaded files
- [ ] Caching strategies

### 7.2 Security

- [ ] File upload security
- [ ] Input validation
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] Role-based access control

## 8. Deployment & Monitoring

### 8.1 Deployment

- [ ] Environment configuration
- [ ] Database migrations
- [ ] File storage setup
- [ ] SSL certificate setup

### 8.2 Monitoring

- [ ] Error tracking
- [ ] Performance monitoring
- [ ] User activity tracking
- [ ] System health checks
