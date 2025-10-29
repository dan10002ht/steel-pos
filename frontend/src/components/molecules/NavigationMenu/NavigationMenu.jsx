import React, { useContext } from 'react';
import { VStack, Box } from '@chakra-ui/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Package, ShoppingCart, Users, UserPlus } from 'lucide-react';
import MenuItem from '../../atoms/MenuItem';
import { useLayoutUi } from '../../../contexts/UiContext';
import { AuthContext } from '../../../contexts/AuthContext';

const menuItems = [
  // {
  //   id: 'dashboard',
  //   label: 'Dashboard',
  //   icon: <Home size={20} />,
  //   path: '/dashboard',
  // },
  {
    id: 'sales',
    label: 'Bán hàng',
    icon: <ShoppingCart size={20} />,
    path: '/sales',
    isStartWith: true,
  },
  {
    id: 'products',
    label: 'Sản phẩm',
    icon: <Package size={20} />,
    path: '/products',
    isStartWith: true,
  },
  {
    id: 'inventory',
    label: 'Nhập kho',
    icon: <Package size={20} />,
    path: '/inventory',
    isStartWith: true,
  },
  {
    id: 'customers',
    label: 'Khách hàng',
    icon: <Users size={20} />,
    path: '/customers',
    isStartWith: true,
  },
];

const NavigationMenu = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { closeSidebar } = useLayoutUi();
  const { isAdmin } = useContext(AuthContext);

  const isActiveRoute = (path, isStartWith) => {
    if (isStartWith) {
      return location.pathname.startsWith(path);
    }
    return location.pathname === path;
  };

  const handleNavigation = path => {
    navigate(path);
    // Close sidebar on mobile after navigation
    closeSidebar();
  };

  // Tạo danh sách menu items với menu quản lý tài khoản
  const allMenuItems = [
    ...menuItems,
    // Chỉ hiển thị menu quản lý tài khoản cho admin
    isAdmin && {
      id: 'user-management',
      label: 'Tài khoản',
      icon: <UserPlus size={20} />,
      path: '/user-management',
    },
  ].filter(Boolean);

  return (
    <VStack spacing={1} p={4} align='stretch' pb={6}>
      {allMenuItems.map(item => (
        <Box key={item.id}>
          <MenuItem
            item={item}
            isActive={isActiveRoute(item.path, item.isStartWith)}
            onClick={() => handleNavigation(item.path)}
          />
        </Box>
      ))}
    </VStack>
  );
};

export default NavigationMenu;
