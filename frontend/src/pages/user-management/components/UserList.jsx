import React, { useContext, useState } from 'react';
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Button,
  HStack,
  Text,
  VStack,
  Spinner,
  Center,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useDisclosure,
  IconButton,
  Tooltip,
  TableContainer,
} from '@chakra-ui/react';
import { Edit, Trash2, Eye, UserPlus } from 'lucide-react';
import { useFetchApi } from '../../../hooks/useFetchApi';
import { USER_ROLE_LABELS, USER_ROLE_COLORS } from '../../../constants/options';
import EditUserModal from './EditUserModal';
import { AuthContext } from '@/contexts/AuthContext';

const UserList = () => {
  const { isAdmin } = useContext(AuthContext);
  const [selectedUser, setSelectedUser] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Admin có thể xóa user (vì chỉ admin mới truy cập được trang này)
  const canDeleteUser = isAdmin;

  const {
    data: users,
    isLoading,
    error,
    refetch,
  } = useFetchApi('users', '/users', {
    enabled: true,
  });

  const handleEditUser = user => {
    setSelectedUser(user);
    onOpen();
  };

  const handleCloseModal = () => {
    setSelectedUser(null);
    onClose();
  };

  const handleUserUpdated = () => {
    refetch();
    handleCloseModal();
  };

  if (isLoading) {
    return (
      <VStack spacing={4} align='center' justify='center' minH='200px'>
        <Spinner size='lg' color='blue.500' />
        <Text color='gray.500'>Đang tải dữ liệu...</Text>
      </VStack>
    );
  }

  if (error) {
    return (
      <Alert status='error' borderRadius='md'>
        <AlertIcon />
        <Box>
          <AlertTitle>Lỗi!</AlertTitle>
          <AlertDescription>
            {error.message ||
              'Không thể tải danh sách người dùng. Vui lòng thử lại.'}
          </AlertDescription>
        </Box>
      </Alert>
    );
  }

  if (!users || users.length === 0) {
    return (
      <VStack spacing={6} align='center' justify='center' minH='300px' py={12}>
        <Box
          p={6}
          borderRadius='full'
          bg='gray.50'
          color='gray.400'
          display='flex'
          alignItems='center'
          justifyContent='center'
        >
          <UserPlus size={48} />
        </Box>
        <VStack spacing={2} textAlign='center'>
          <Text fontSize='xl' fontWeight='semibold' color='gray.700'>
            Chưa có người dùng nào
          </Text>
          <Text fontSize='md' color='gray.500' maxW='400px'>
            Bắt đầu bằng cách tạo tài khoản đầu tiên trong hệ thống
          </Text>
        </VStack>
      </VStack>
    );
  }

  return (
    <Box>
      <TableContainer>
        <Table variant='simple'>
          <Thead>
            <Tr>
              <Th fontWeight='bold'>Họ tên</Th>
              <Th fontWeight='bold'>Tên đăng nhập</Th>
              <Th fontWeight='bold'>Email</Th>
              <Th fontWeight='bold'>Vai trò</Th>
              <Th fontWeight='bold'>Trạng thái</Th>
              <Th fontWeight='bold'>Ngày tạo</Th>
              <Th fontWeight='bold' textAlign='center'>
                Thao tác
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {users.map(user => (
              <Tr key={user.id} _hover={{ bg: 'gray.50' }}>
                <Td>
                  <Text fontWeight='medium'>{user.full_name}</Text>
                </Td>
                <Td>
                  <Text color='gray.600'>{user.username}</Text>
                </Td>
                <Td>
                  <Text color='gray.600'>{user.email}</Text>
                </Td>
                <Td>
                  <Badge
                    colorScheme={USER_ROLE_COLORS[user.role]}
                    variant='subtle'
                  >
                    {USER_ROLE_LABELS[user.role]}
                  </Badge>
                </Td>
                <Td>
                  <Badge
                    colorScheme={user.is_active ? 'green' : 'red'}
                    variant='subtle'
                  >
                    {user.is_active ? 'Hoạt động' : 'Không hoạt động'}
                  </Badge>
                </Td>
                <Td>
                  <Text color='gray.600' fontSize='sm'>
                    {new Date(user.created_at).toLocaleDateString('vi-VN')}
                  </Text>
                </Td>
                <Td>
                  <HStack justify='center' spacing={2}>
                    <Tooltip label='Chỉnh sửa'>
                      <IconButton
                        icon={<Edit size={16} />}
                        size='sm'
                        variant='ghost'
                        colorScheme='orange'
                        onClick={() => handleEditUser(user)}
                      />
                    </Tooltip>
                  </HStack>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>

      {/* Edit User Modal */}
      <EditUserModal
        isOpen={isOpen}
        onClose={handleCloseModal}
        user={selectedUser}
        onSuccess={handleUserUpdated}
      />
    </Box>
  );
};

export default UserList;
