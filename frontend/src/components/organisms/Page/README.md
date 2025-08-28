# Page Component

Component Page chung để wrap tất cả các pages (ngoại trừ login page) để handle việc title, subtitle, breadcrumbs và actions.

## 🎯 Tính năng

- **Header Section**: Title, subtitle, breadcrumbs
- **Actions**: Primary và secondary actions
- **Content Area**: Flexible content với proper spacing
- **Loading States**: Tích hợp loading spinner
- **Error States**: Handle error display
- **Responsive Design**: Mobile-first approach

## 📦 Cài đặt

```jsx
import Page from "../../components/organisms/Page";
```

## 🚀 Cách sử dụng

### Basic Usage

```jsx
<Page
  title="Danh sách sản phẩm"
  subtitle="Quản lý tất cả sản phẩm trong hệ thống"
>
  {/* Page content */}
</Page>
```

### Với Breadcrumbs

```jsx
<Page
  title="Sản phẩm"
  subtitle="Quản lý danh mục sản phẩm"
  breadcrumbs={[
    { label: "Dashboard", href: "/dashboard" },
    { label: "Sản phẩm", href: "/products" },
  ]}
>
  {/* Page content */}
</Page>
```

### Với Actions

```jsx
<Page
  title="Kho hàng"
  subtitle="Quản lý tồn kho và nhập xuất"
  primaryActions={[
    {
      label: "Tạo đơn nhập",
      icon: <Package size={16} />,
      onClick: () => navigate("/inventory/create"),
      colorScheme: "blue",
    },
  ]}
  secondaryActions={[
    {
      label: "Báo cáo",
      icon: <FileText size={16} />,
      onClick: () => navigate("/inventory/report"),
      variant: "outline",
    },
    {
      label: "Xuất Excel",
      icon: <Download size={16} />,
      onClick: () => console.log("Export Excel"),
      variant: "outline",
    },
  ]}
>
  {/* Page content */}
</Page>
```

### Với Loading State

```jsx
<Page title="Danh sách sản phẩm" isLoading={isLoading}>
  {/* Content sẽ không hiển thị khi loading */}
</Page>
```

### Với Error State

```jsx
<Page title="Danh sách sản phẩm" error={error}>
  {/* Content sẽ không hiển thị khi có error */}
</Page>
```

## 📋 Props

### Basic Props

| Prop       | Type        | Default | Description                  |
| ---------- | ----------- | ------- | ---------------------------- |
| `title`    | `string`    | -       | **Required**. Tiêu đề trang  |
| `subtitle` | `string`    | -       | Mô tả trang                  |
| `children` | `ReactNode` | -       | **Required**. Nội dung trang |

### Navigation Props

| Prop          | Type                                   | Default | Description           |
| ------------- | -------------------------------------- | ------- | --------------------- |
| `breadcrumbs` | `Array<{label: string, href: string}>` | `[]`    | Breadcrumb navigation |

### Actions Props

| Prop               | Type            | Default | Description                 |
| ------------------ | --------------- | ------- | --------------------------- |
| `primaryActions`   | `Array<Action>` | `[]`    | Primary actions (buttons)   |
| `secondaryActions` | `Array<Action>` | `[]`    | Secondary actions (buttons) |

### Action Object

```typescript
interface Action {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  colorScheme?: string;
  variant?: string;
  size?: string;
  isLoading?: boolean;
  isDisabled?: boolean;
}
```

### State Props

| Prop        | Type            | Default | Description            |
| ----------- | --------------- | ------- | ---------------------- |
| `isLoading` | `boolean`       | `false` | Hiển thị loading state |
| `error`     | `Error \| null` | `null`  | Hiển thị error state   |

### Layout Props

| Prop      | Type     | Default  | Description               |
| --------- | -------- | -------- | ------------------------- |
| `maxW`    | `string` | `"full"` | Max width của page        |
| `spacing` | `number` | `6`      | Spacing giữa các elements |

### Custom Props

| Prop          | Type        | Default | Description                    |
| ------------- | ----------- | ------- | ------------------------------ |
| `headerRight` | `ReactNode` | -       | Custom content bên phải header |
| `headerLeft`  | `ReactNode` | -       | Custom content bên trái header |

## 🎨 Ví dụ thực tế

### Product List Page

```jsx
<Page
  title="Sản phẩm"
  subtitle="Quản lý danh mục sản phẩm trong hệ thống"
  breadcrumbs={[
    { label: "Dashboard", href: "/dashboard" },
    { label: "Sản phẩm", href: "/products" },
  ]}
  primaryActions={[
    {
      label: "Thêm sản phẩm",
      icon: <Plus size={16} />,
      onClick: () => navigate("/products/create"),
      colorScheme: "blue",
    },
  ]}
  secondaryActions={[
    {
      label: "Import Excel",
      icon: <Upload size={16} />,
      onClick: () => console.log("Import Excel"),
      variant: "outline",
    },
    {
      label: "Xuất Excel",
      icon: <Download size={16} />,
      onClick: () => console.log("Export Excel"),
      variant: "outline",
    },
  ]}
>
  {/* Filters */}
  <Card shadow="sm">
    <CardBody>{/* Search and filters */}</CardBody>
  </Card>

  {/* Data Table */}
  <Card shadow="sm">
    <CardBody>{/* Table content */}</CardBody>
  </Card>
</Page>
```

### Inventory Page

```jsx
<Page
  title="Kho hàng"
  subtitle="Quản lý tồn kho và nhập xuất"
  breadcrumbs={[
    { label: "Dashboard", href: "/dashboard" },
    { label: "Kho hàng", href: "/inventory" },
  ]}
  primaryActions={[
    {
      label: "Tạo đơn nhập",
      icon: <Package size={16} />,
      onClick: () => navigate("/inventory/create"),
      colorScheme: "green",
    },
  ]}
  secondaryActions={[
    {
      label: "Báo cáo",
      icon: <FileText size={16} />,
      onClick: () => navigate("/inventory/report"),
      variant: "outline",
    },
  ]}
>
  {/* Inventory content */}
</Page>
```

## 🔧 Customization

### Custom Header Content

```jsx
<Page
  title="Dashboard"
  headerRight={
    <HStack spacing={2}>
      <Badge colorScheme="green">Online</Badge>
      <Text fontSize="sm">Last updated: 2 min ago</Text>
    </HStack>
  }
  headerLeft={
    <Button size="sm" variant="ghost">
      <RefreshCw size={16} />
    </Button>
  }
>
  {/* Content */}
</Page>
```

### Custom Loading State

```jsx
<Page title="Loading..." isLoading={true}>
  {/* Content sẽ không hiển thị */}
</Page>
```

## 🎯 Best Practices

1. **Luôn sử dụng Page component** cho tất cả pages (trừ login)
2. **Đặt title ngắn gọn** và mô tả rõ ràng
3. **Sử dụng breadcrumbs** cho navigation phức tạp
4. **Nhóm actions logic** vào primary và secondary
5. **Handle loading và error states** đúng cách
6. **Responsive design** cho mobile

## 🐛 Troubleshooting

### Actions không hiển thị

- Kiểm tra `primaryActions` và `secondaryActions` có đúng format không
- Đảm bảo `onClick` function được định nghĩa

### Breadcrumbs không hoạt động

- Kiểm tra `href` có đúng route không
- Đảm bảo sử dụng `BreadcrumbLink` component

### Loading state không hoạt động

- Đảm bảo `isLoading` prop được truyền đúng
- Kiểm tra React Query integration
