import React from "react";
import { VStack, Box } from "@chakra-ui/react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  Package,
  ShoppingCart,
  Users,
  FileText,
  TrendingUp,
} from "lucide-react";
import MenuItem from "../../atoms/MenuItem";
import { useLayoutUi } from "../../../contexts/UiContext";

const menuItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: <Home size={20} />,
    path: "/dashboard",
  },
  {
    id: "products",
    label: "Sản phẩm",
    icon: <Package size={20} />,
    path: "/products",
  },
  {
    id: "sales",
    label: "Bán hàng",
    icon: <ShoppingCart size={20} />,
    path: "/sales",
    subItems: [
      {
        id: "sales-create",
        label: "Tạo hoá đơn mới",
        path: "/sales/create",
      },
      {
        id: "sales-list",
        label: "Danh sách bán hàng",
        path: "/sales/list",
      },
    ],
  },
  {
    id: "inventory",
    label: "Nhập kho",
    icon: <Package size={20} />,
    path: "/inventory",
  },
  {
    id: "customers",
    label: "Khách hàng",
    icon: <Users size={20} />,
    path: "/customers",
  },
  {
    id: "reports",
    label: "Báo cáo",
    icon: <FileText size={20} />,
    path: "/reports",
  },
  {
    id: "analytics",
    label: "Thống kê",
    icon: <TrendingUp size={20} />,
    path: "/analytics",
  },
];

const NavigationMenu = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { closeSidebar } = useLayoutUi();

  const isActiveRoute = (path) => {
    if (path === "/inventory") {
      return location.pathname.startsWith("/inventory");
    }
    if (path === "/sales") {
      return location.pathname.startsWith("/sales");
    }
    return location.pathname === path;
  };

  const handleNavigation = (path) => {
    navigate(path);
    // Close sidebar on mobile after navigation
    closeSidebar();
  };

  return (
    <VStack spacing={1} p={4} align="stretch" pb={6}>
      {menuItems.map((item) => (
        <Box key={item.id}>
          <MenuItem
            item={item}
            isActive={isActiveRoute(item.path)}
            onClick={() => handleNavigation(item.path)}
          />

          {/* Sub-menu items */}
          {item.subItems && isActiveRoute(item.path) && (
            <VStack spacing={1} mt={2} ml={4} align="stretch">
              {item.subItems.map((subItem) => (
                <MenuItem
                  key={subItem.id}
                  item={subItem}
                  isActive={isActiveRoute(subItem.path)}
                  onClick={() => handleNavigation(subItem.path)}
                  isSubItem={true}
                />
              ))}
            </VStack>
          )}
        </Box>
      ))}
    </VStack>
  );
};

export default NavigationMenu;
