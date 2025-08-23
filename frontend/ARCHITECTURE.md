# 🏗️ Architecture Patterns cho Steel POS

## 📋 Tổng quan

Dự án Steel POS sử dụng kết hợp nhiều design patterns để tạo ra một codebase có thể maintain, scale và dễ hiểu.

## 🎯 Patterns được sử dụng

### 1. **Atomic Design** 🧬

```
src/components/
├── atoms/           # Basic building blocks
│   ├── Button/
│   ├── Input/
│   └── Icon/
├── molecules/       # Simple combinations of atoms
│   ├── ProductCard/
│   ├── SearchBar/
│   └── StatusBadge/
├── organisms/       # Complex UI components
│   ├── ProductGrid/
│   ├── CartSidebar/
│   └── InvoiceForm/
├── templates/       # Page layouts
└── pages/          # Complete pages
```

**Ưu điểm:**

- Tái sử dụng cao
- Dễ maintain và test
- Consistent design system
- Scalable

### 2. **Feature-Based Architecture** 🏢

```
src/features/
├── sales/
│   ├── components/
│   ├── hooks/
│   ├── services/
│   └── types/
├── inventory/
├── products/
└── customers/
```

**Ưu điểm:**

- Tách biệt logic theo business domain
- Dễ tìm và sửa code
- Team có thể làm việc độc lập
- Clear boundaries

### 3. **Custom Hooks Pattern** 🎣

```javascript
// features/sales/hooks/useCart.js
const useCart = () => {
  // Logic here
  return { cartItems, addToCart, removeFromCart };
};
```

**Ưu điểm:**

- Tái sử dụng logic
- Clean component code
- Easy testing
- Separation of concerns

### 4. **Service Layer Pattern** 🔧

```javascript
// features/sales/services/salesService.js
class SalesService {
  async createInvoice(data) {
    /* ... */
  }
  async getInvoices() {
    /* ... */
  }
}
```

**Ưu điểm:**

- Centralized API calls
- Easy to mock for testing
- Consistent error handling
- Reusable across components

### 5. **Context Pattern** 🌐

```javascript
// shared/contexts/CartContext.jsx
const CartProvider = ({ children }) => {
  // Global state management
};
```

**Ưu điểm:**

- Global state without prop drilling
- Shared data across components
- Clean component interfaces

## 🚀 Best Practices

### 1. **Component Structure**

```javascript
// ✅ Good
const ProductCard = ({ product, onAddToCart }) => {
  return <div>...</div>;
};

// ❌ Bad
const ProductCard = (props) => {
  return <div>...</div>;
};
```

### 2. **File Naming**

```
✅ Button.jsx
✅ ProductCard.jsx
✅ useCart.js
✅ salesService.js

❌ button.jsx
❌ product-card.jsx
❌ use-cart.js
```

### 3. **Import Organization**

```javascript
// 1. React imports
import React from "react";

// 2. Third-party libraries
import { Box, Text } from "@chakra-ui/react";
import { ShoppingCart } from "lucide-react";

// 3. Internal components
import Button from "../../atoms/Button/Button";

// 4. Hooks and utilities
import { useCart } from "../../../features/sales/hooks/useCart";
```

### 4. **Props Destructuring**

```javascript
// ✅ Good
const ProductCard = ({ product, onAddToCart, isInStock = true }) => {
  // ...
};

// ❌ Bad
const ProductCard = (props) => {
  const product = props.product;
  // ...
};
```

## 📁 Folder Structure

```
src/
├── components/
│   ├── atoms/           # Basic UI components
│   ├── molecules/       # Simple combinations
│   ├── organisms/       # Complex components
│   ├── templates/       # Page layouts
│   └── Layout/          # App layout
├── features/
│   ├── sales/           # Sales feature
│   ├── inventory/       # Inventory feature
│   ├── products/        # Products feature
│   └── customers/       # Customers feature
├── shared/
│   ├── contexts/        # Global contexts
│   ├── hooks/           # Shared hooks
│   ├── utils/           # Utility functions
│   └── constants/       # App constants
├── pages/               # Page components
└── App.jsx             # Root component
```

## 🎨 Design System

### Color Palette

```javascript
const colors = {
  primary: {
    50: "#E3F2FD",
    500: "#2196F3",
    900: "#0D47A1",
  },
  success: "#4CAF50",
  warning: "#FF9800",
  error: "#F44336",
};
```

### Spacing Scale

```javascript
const spacing = {
  xs: "0.25rem", // 4px
  sm: "0.5rem", // 8px
  md: "1rem", // 16px
  lg: "1.5rem", // 24px
  xl: "2rem", // 32px
};
```

## 🔧 Development Workflow

### 1. **Tạo component mới**

```bash
# Tạo atom
mkdir src/components/atoms/NewComponent
touch src/components/atoms/NewComponent/NewComponent.jsx
touch src/components/atoms/NewComponent/index.js

# Tạo feature
mkdir src/features/newFeature
mkdir src/features/newFeature/{components,hooks,services}
```

### 2. **Testing Strategy**

```javascript
// Unit tests cho atoms
// Integration tests cho molecules/organisms
// E2E tests cho features
```

### 3. **Performance Optimization**

- React.memo cho components
- useMemo/useCallback cho expensive operations
- Lazy loading cho routes
- Code splitting theo features

## 📚 Resources

- [Atomic Design Methodology](https://bradfrost.com/blog/post/atomic-web-design/)
- [Feature-Based Architecture](https://martinfowler.com/articles/micro-frontends.html)
- [React Best Practices](https://react.dev/learn)
- [Chakra UI Documentation](https://chakra-ui.com/)

## 🤝 Contributing

1. Follow the established patterns
2. Write meaningful commit messages
3. Add tests for new features
4. Update documentation
5. Use TypeScript for new features (optional)
