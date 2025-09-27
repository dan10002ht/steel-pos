import React, { useContext, useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Select,
  Button,
  VStack,
  HStack,
  Text,
  useColorModeValue,
  FormErrorMessage,
} from '@chakra-ui/react';
import { useCreateApi } from '../../../hooks/useCreateApi';
import { USER_ROLES, USER_ROLE_OPTIONS } from '../../../constants/options';
import { AuthContext } from '../../../contexts/AuthContext';

const CreateUserModal = ({ isOpen, onClose, onSuccess, onError }) => {
  const { isAdmin } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    role: USER_ROLES.ACCOUNTANT, // Default role cho internal system
  });

  const [errors, setErrors] = useState({});

  const bgColor = useColorModeValue('white', 'gray.800');

  // Admin có thể tạo tài khoản mới (vì chỉ admin mới truy cập được trang này)
  const canCreateUser = isAdmin;

  const createUserMutation = useCreateApi('/users', {
    onSuccess: () => {
      onSuccess();
      resetForm();
    },
    onError: error => {
      onError(error);
    },
  });

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      fullName: '',
      role: USER_ROLES.ACCOUNTANT,
    });
    setErrors({});
  };

  const handleInputChange = (field, value) => {
    // Convert username to lowercase and remove spaces
    if (field === 'username') {
      value = value.toLowerCase().replace(/\s/g, '');
    }

    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Tên đăng nhập là bắt buộc';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Tên đăng nhập phải có ít nhất 3 ký tự';
    } else if (/\s/.test(formData.username)) {
      newErrors.username = 'Tên đăng nhập không được chứa khoảng cách';
    } else if (!/^[a-z0-9_]+$/.test(formData.username)) {
      newErrors.username =
        'Tên đăng nhập chỉ được chứa chữ thường, số và dấu gạch dưới';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email là bắt buộc';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Mật khẩu là bắt buộc';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Họ tên là bắt buộc';
    } else if (formData.fullName.length < 2) {
      newErrors.fullName = 'Họ tên phải có ít nhất 2 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = e => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    createUserMutation.mutate(formData);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size='lg'>
      <ModalOverlay />
      <ModalContent bg={bgColor}>
        <ModalHeader>Tạo tài khoản mới</ModalHeader>
        <ModalCloseButton />

        <form onSubmit={handleSubmit}>
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isInvalid={!!errors.username}>
                <FormLabel>Tên đăng nhập</FormLabel>
                <Input
                  value={formData.username}
                  onChange={e => handleInputChange('username', e.target.value)}
                  placeholder='Nhập tên đăng nhập'
                />
                <FormErrorMessage>{errors.username}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.email}>
                <FormLabel>Email</FormLabel>
                <Input
                  type='email'
                  value={formData.email}
                  onChange={e => handleInputChange('email', e.target.value)}
                  placeholder='Nhập email'
                />
                <FormErrorMessage>{errors.email}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.password}>
                <FormLabel>Mật khẩu</FormLabel>
                <Input
                  type='password'
                  value={formData.password}
                  onChange={e => handleInputChange('password', e.target.value)}
                  placeholder='Nhập mật khẩu'
                />
                <FormErrorMessage>{errors.password}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.fullName}>
                <FormLabel>Họ và tên</FormLabel>
                <Input
                  value={formData.fullName}
                  onChange={e => handleInputChange('fullName', e.target.value)}
                  placeholder='Nhập họ và tên'
                />
                <FormErrorMessage>{errors.fullName}</FormErrorMessage>
              </FormControl>

              <FormControl>
                <FormLabel>Vai trò</FormLabel>
                <Select
                  value={formData.role}
                  onChange={e => handleInputChange('role', e.target.value)}
                >
                  {canCreateUser &&
                    USER_ROLE_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <HStack spacing={3}>
              <Button variant='ghost' onClick={handleClose}>
                Hủy
              </Button>
              <Button
                type='submit'
                colorScheme='blue'
                isLoading={createUserMutation.isPending}
                loadingText='Đang tạo...'
              >
                Tạo tài khoản
              </Button>
            </HStack>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default CreateUserModal;
