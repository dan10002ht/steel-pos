# Atomic Design Structure for MainLayout

MainLayout đã được tách thành các component theo nguyên tắc Atomic Design để dễ bảo trì và tái sử dụng.

## Cấu trúc thư mục

```
components/
├── atoms/                    # Các component cơ bản nhất
│   ├── Logo/                # Logo component
│   ├── MenuItem/            # Menu item component
│   └── UserAvatar/          # User avatar component
├── molecules/               # Các component kết hợp từ atoms
│   ├── NavigationMenu/      # Menu navigation
│   ├── UserMenu/            # User dropdown menu
│   ├── Sidebar/             # Sidebar container
│   └── Header/              # Top header
└── organisms/               # Các component phức tạp
    └── MainLayout/          # Main layout (tổng hợp)
```

## Components

### Atoms (Cơ bản nhất)

#### Logo

- **File**: `atoms/Logo/Logo.jsx`
- **Mô tả**: Component hiển thị logo Steel POS
- **Props**: Không có
- **Sử dụng**: Trong Sidebar

#### MenuItem

- **File**: `atoms/MenuItem/MenuItem.jsx`
- **Mô tả**: Component cho từng item trong menu
- **Props**:
  - `item`: Object chứa thông tin menu item
  - `isActive`: Boolean xác định item có đang active không
  - `onClick`: Function xử lý click
  - `isSubItem`: Boolean xác định có phải sub-item không
- **Sử dụng**: Trong NavigationMenu

#### UserAvatar

- **File**: `atoms/UserAvatar/UserAvatar.jsx`
- **Mô tả**: Component hiển thị avatar và thông tin user
- **Props**: `user`: Object chứa thông tin user
- **Sử dụng**: Trong UserMenu

### Molecules (Kết hợp atoms)

#### NavigationMenu

- **File**: `molecules/NavigationMenu/NavigationMenu.jsx`
- **Mô tả**: Menu navigation chính
- **Sử dụng**: MenuItem atoms
- **Sử dụng trong**: Sidebar

#### UserMenu

- **File**: `molecules/UserMenu/UserMenu.jsx`
- **Mô tả**: Dropdown menu cho user
- **Sử dụng**: UserAvatar atom
- **Sử dụng trong**: Sidebar

#### Sidebar

- **File**: `molecules/Sidebar/Sidebar.jsx`
- **Mô tả**: Container cho sidebar
- **Sử dụng**: Logo, NavigationMenu, UserMenu
- **Sử dụng trong**: MainLayout

#### Header

- **File**: `molecules/Header/Header.jsx`
- **Mô tả**: Header phía trên
- **Sử dụng trong**: MainLayout

### Organisms (Phức tạp nhất)

#### MainLayout

- **File**: `organisms/MainLayout/MainLayout.jsx`
- **Mô tả**: Layout chính của ứng dụng
- **Sử dụng**: Sidebar, Header molecules
- **Props**: `children`: Nội dung trang

## Cách sử dụng

### Import MainLayout mới

```jsx
import MainLayout from "../components/organisms/MainLayout";

// Sử dụng
<MainLayout>
  <YourPageContent />
</MainLayout>;
```

### Import các component riêng lẻ

```jsx
import Logo from "../components/atoms/Logo";
import NavigationMenu from "../components/molecules/NavigationMenu";
import Sidebar from "../components/molecules/Sidebar";
```

## Lợi ích

1. **Tái sử dụng**: Các atoms và molecules có thể tái sử dụng ở nhiều nơi
2. **Dễ bảo trì**: Mỗi component có trách nhiệm riêng biệt
3. **Dễ test**: Có thể test từng component riêng lẻ
4. **Dễ mở rộng**: Dễ dàng thêm tính năng mới
5. **Tổ chức code**: Code được tổ chức theo nguyên tắc rõ ràng

## Migration

File `Layout/MainLayout.jsx` cũ đã được thay thế bằng import từ MainLayout mới. Tất cả các import hiện tại sẽ vẫn hoạt động bình thường.
