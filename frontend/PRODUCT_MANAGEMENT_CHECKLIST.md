# 📋 Checklist - Quản lý Sản phẩm (Frontend)

## 🎯 Tổng quan

Tính năng quản lý sản phẩm cho phép user tạo, xem, chỉnh sửa và xóa sản phẩm với các variants khác nhau.

## 📊 Data Structure

### Product Model

```javascript
{
  id: string,
  name: string,           // Tên sản phẩm
  variants: [             // Danh sách variants
    {
      id: string,
      name: string,       // Tên variant (VD: "Đỏ", "XL", "100g")
      sku: string,        // Mã SKU
      stock: number,      // Số lượng tồn kho
      sold: number,       // Số lượng đã bán
      price: number,      // Giá tiền
      unit: string        // Đơn vị (VD: "cái", "kg", "m")
    }
  ],
  unit: string,           // Đơn vị chung cho sản phẩm
  notes: string,          // Ghi chú (optional)
  category: string,       // Danh mục sản phẩm
  createdAt: string,
  updatedAt: string
}
```

## 🛣️ Routes Structure

### 1. Product List Page

- **Route**: `/products`
- **Component**: `ProductList.jsx`
- **Features**:
  - Data table hiển thị danh sách sản phẩm
  - Search và filter
  - Pagination
  - Actions: View, Edit, Delete

### 2. Create Product Page

- **Route**: `/products/create`
- **Component**: `CreateProduct.jsx`
- **Features**:
  - Form tạo sản phẩm mới
  - Dynamic variants management
  - Validation

### 3. Edit Product Page

- **Route**: `/products/:id/edit`
- **Component**: `EditProduct.jsx`
- **Features**:
  - Form chỉnh sửa sản phẩm
  - Pre-populated data
  - Validation

### 4. Product Detail Page

- **Route**: `/products/:id`
- **Component**: `ProductDetail.jsx`
- **Features**:
  - Hiển thị chi tiết sản phẩm
  - Variants breakdown
  - Stock history

## 📋 Implementation Checklist

### Phase 1: Setup & Structure ✅

- [x] **1.1** Tạo mock data cho products
- [x] **1.2** Tạo ProductService cho API calls
- [x] **1.3** Tạo custom hooks (useProducts, useProduct)
- [x] **1.4** Cập nhật routing trong App.jsx
- [x] **1.5** Tạo file structure theo Atomic Design

### Phase 2: Product List Page ✅

- [x] **2.1** Tạo ProductList component
- [x] **2.2** Tạo ProductTable component với data table
- [x] **2.3** Implement search functionality
- [x] **2.4** Implement filter by category
- [x] **2.5** Implement pagination
- [x] **2.6** Tạo ProductActions component (View, Edit, Delete)
- [x] **2.7** Tạo ProductStatusBadge component
- [x] **2.8** Implement delete confirmation modal

### Phase 3: Create Product Page ✅

- [x] **3.1** Tạo CreateProduct component
- [x] **3.2** Tạo ProductForm component (reusable)
- [x] **3.3** Tạo VariantForm component
- [x] **3.4** Implement dynamic variants management
- [x] **3.5** Implement form validation
- [x] **3.6** Tạo CategorySelect component
- [x] **3.7** Bỏ field "Danh mục" và "Số lượng đã bán" theo yêu cầu
- [x] **3.8** Tạo form submission handling

### Phase 4: Edit Product Page ✅

- [x] **4.1** Tạo EditProduct component
- [x] **4.2** Implement data fetching for edit
- [x] **4.3** Pre-populate form with existing data
- [x] **4.4** Handle variants editing
- [x] **4.5** Implement update functionality

### Phase 5: Product Detail Page ✅

- [x] **5.1** Tạo ProductDetail component
- [x] **5.2** Tạo ProductInfo component
- [x] **5.3** Tạo VariantsTable component
- [x] **5.4** Tạo ProductStats component với Stat cards
- [x] **5.5** Implement loading states và error handling

### Phase 6: Components & Utilities

- [ ] **6.1** Tạo ProductCard component (for grid view)
- [ ] **6.2** Tạo ProductSearch component
- [ ] **6.3** Tạo ProductFilter component
- [ ] **6.4** Tạo ProductPagination component
- [ ] **6.5** Tạo ProductModal components
- [ ] **6.6** Tạo ProductSkeleton components (loading states)

### Phase 7: State Management & Hooks

- [ ] **7.1** Tạo useProducts hook
- [ ] **7.2** Tạo useProduct hook
- [ ] **7.3** Tạo useProductActions hook
- [ ] **7.4** Implement ProductContext
- [ ] **7.5** Tạo product utilities (formatting, validation)

### Phase 8: UI/UX Enhancements

- [ ] **8.1** Implement loading states
- [ ] **8.2** Implement error handling
- [ ] **8.3** Add success/error notifications
- [ ] **8.4** Implement responsive design
- [ ] **8.5** Add keyboard shortcuts
- [ ] **8.6** Implement bulk actions (optional)

## 📁 File Structure

```
src/
├── features/
│   └── products/
│       ├── components/
│       │   ├── ProductList.jsx
│       │   ├── ProductTable.jsx
│       │   ├── ProductForm.jsx
│       │   ├── VariantForm.jsx
│       │   ├── ProductCard.jsx
│       │   ├── ProductDetail.jsx
│       │   ├── ProductActions.jsx
│       │   ├── ProductSearch.jsx
│       │   ├── ProductFilter.jsx
│       │   └── ProductModal.jsx
│       ├── hooks/
│       │   ├── useProducts.js
│       │   ├── useProduct.js
│       │   └── useProductActions.js
│       ├── services/
│       │   └── productService.js
│       ├── context/
│       │   └── ProductContext.jsx
│       ├── utils/
│       │   ├── productUtils.js
│       │   └── validation.js
│       └── data/
│           └── mockProducts.js
├── pages/
│   ├── products/
│   │   ├── ProductListPage.jsx
│   │   ├── CreateProductPage.jsx
│   │   ├── EditProductPage.jsx
│   │   └── ProductDetailPage.jsx
```

## 🎨 UI Components Design

### Data Table Columns

1. **Tên sản phẩm** - Product name with variants
2. **Danh mục** - Category
3. **Tồn kho** - Total stock across variants
4. **Đã bán** - Total sold across variants
5. **Giá** - Price range (min-max)
6. **Trạng thái** - Status badge
7. **Actions** - View, Edit, Delete buttons

### Form Fields

1. **Tên sản phẩm** - Text input
2. **Danh mục** - Select dropdown
3. **Đơn vị** - Text input
4. **Ghi chú** - Textarea
5. **Variants** - Dynamic form array
   - Tên variant
   - SKU
   - Tồn kho
   - Giá
   - Đơn vị

## 🔧 Technical Requirements

### Dependencies

- [ ] React Hook Form (form management)
- [ ] React Query (data fetching)
- [ ] React Table (data table)
- [ ] Zod (validation)
- [ ] React Hot Toast (notifications)

### Performance Considerations

- [ ] Implement pagination
- [ ] Add search debouncing
- [ ] Optimize re-renders
- [ ] Add loading skeletons
- [ ] Implement error boundaries

### Accessibility

- [ ] Add ARIA labels
- [ ] Keyboard navigation
- [ ] Screen reader support
- [ ] Focus management

## 📝 Notes & Considerations

### Business Logic

- Variants có thể có giá khác nhau
- Tồn kho được tính theo từng variant
- SKU phải unique
- Validation rules cần được định nghĩa rõ ràng

### UX Considerations

- Form validation real-time
- Confirmation dialogs cho delete actions
- Success/error feedback
- Loading states cho tất cả async operations

### Future Enhancements

- Bulk import/export
- Product images
- Stock alerts
- Price history
- Product analytics
