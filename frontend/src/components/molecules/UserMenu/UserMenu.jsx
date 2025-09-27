import React from 'react';
import {
  Box,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  HStack,
  IconButton,
} from '@chakra-ui/react';
import { ChevronDown, User, Settings, LogOut, LogOutIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/useAuthContext';
import UserAvatar from '../../atoms/UserAvatar';
import { useColorModeValue } from '@chakra-ui/react';

const UserMenu = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const hoverBg = useColorModeValue('gray.50', 'gray.700');

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <Box p={{ base: '2', md: '4' }}>
      <HStack spacing={3} w='full'>
        <UserAvatar user={user} />
        <IconButton
          size='sm'
          variant='ghost'
          icon={<LogOutIcon color='red' size={16} />}
          onClick={handleLogout}
        />
      </HStack>
    </Box>
  );
};

export default UserMenu;
