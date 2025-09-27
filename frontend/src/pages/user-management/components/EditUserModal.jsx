import React, { useState, useEffect } from 'react';
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
  Switch,
  FormErrorMessage,
  useColorModeValue,
  Text,
  Divider,
  Collapse,
  InputGroup,
  InputRightElement,
  IconButton,
  Box,
} from '@chakra-ui/react';
import { Eye, EyeOff } from 'lucide-react';
import { useEditApi } from '../../../hooks/useEditApi';
import {
  USER_ROLES,
  USER_ROLE_LABELS,
  USER_ROLE_OPTIONS,
} from '../../../constants/options';
import { useContext } from 'react';
import { AuthContext } from '../../../contexts/AuthContext';

const EditUserModal = ({ isOpen, onClose, user, onSuccess }) => {
  const { user: currentUser } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    fullName: '',
    role: USER_ROLES.ACCOUNTANT,
    isActive: true,
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const bgColor = useColorModeValue('white', 'gray.800');

  // Check if admin is editing their own account
  const isEditingOwnAccount = currentUser && user && currentUser.id === user.id;

  const updateUserMutation = useEditApi(`/users/${user?.id}`, {
    onSuccess: () => {
      onSuccess();
    },
    onError: error => {
      console.error('Update user error:', error);
    },
  });

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.full_name || '',
        role: user.role || USER_ROLES.ACCOUNTANT,
        isActive: user.is_active !== undefined ? user.is_active : true,
      });
      // Reset password data when user changes
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setShowPasswordChange(false);
    }
  }, [user]);

  const handleInputChange = (field, value) => {
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

  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({
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

  const togglePasswordVisibility = field => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Họ tên là bắt buộc';
    } else if (formData.fullName.length < 2) {
      newErrors.fullName = 'Họ tên phải có ít nhất 2 ký tự';
    }

    // Validate password fields if password change is enabled
    if (showPasswordChange) {
      // Only require current password if admin is editing their own account
      if (isEditingOwnAccount && !passwordData.currentPassword.trim()) {
        newErrors.currentPassword = 'Mật khẩu hiện tại là bắt buộc';
      }

      if (!passwordData.newPassword.trim()) {
        newErrors.newPassword = 'Mật khẩu mới là bắt buộc';
      } else if (passwordData.newPassword.length < 6) {
        newErrors.newPassword = 'Mật khẩu mới phải có ít nhất 6 ký tự';
      }

      if (!passwordData.confirmPassword.trim()) {
        newErrors.confirmPassword = 'Xác nhận mật khẩu là bắt buộc';
      } else if (passwordData.newPassword !== passwordData.confirmPassword) {
        newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = e => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const updateData = {
      full_name: formData.fullName,
      role: formData.role,
      is_active: formData.isActive,
    };

    // Include password data if password change is enabled
    if (showPasswordChange) {
      // Only include current password if admin is editing their own account
      if (isEditingOwnAccount) {
        updateData.current_password = passwordData.currentPassword;
      }
      updateData.new_password = passwordData.newPassword;
    }
    console.log(updateData);

    return updateUserMutation.mutate({ data: updateData });
  };

  const handleClose = () => {
    setFormData({
      fullName: '',
      role: USER_ROLES.ACCOUNTANT,
      isActive: true,
    });
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setErrors({});
    setShowPasswordChange(false);
    setShowPasswords({
      current: false,
      new: false,
      confirm: false,
    });
    onClose();
  };

  if (!user) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size='lg'>
      <ModalOverlay />
      <ModalContent bg={bgColor}>
        <ModalHeader>Chỉnh sửa thông tin người dùng</ModalHeader>
        <ModalCloseButton />

        <form onSubmit={handleSubmit}>
          <ModalBody>
            <VStack spacing={4}>
              {/* User Info Display */}
              <VStack
                spacing={2}
                align='stretch'
                w='full'
                p={4}
                bg='gray.50'
                borderRadius='md'
              >
                <Text fontSize='sm' color='gray.600'>
                  Thông tin cơ bản
                </Text>
                <HStack justify='space-between'>
                  <Text fontSize='sm' fontWeight='medium'>
                    Tên đăng nhập:
                  </Text>
                  <Text fontSize='sm' color='gray.600'>
                    {user.username}
                  </Text>
                </HStack>
                <HStack justify='space-between'>
                  <Text fontSize='sm' fontWeight='medium'>
                    Email:
                  </Text>
                  <Text fontSize='sm' color='gray.600'>
                    {user.email}
                  </Text>
                </HStack>
                <HStack justify='space-between'>
                  <Text fontSize='sm' fontWeight='medium'>
                    Ngày tạo:
                  </Text>
                  <Text fontSize='sm' color='gray.600'>
                    {new Date(user.created_at).toLocaleDateString('vi-VN')}
                  </Text>
                </HStack>
              </VStack>

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
                  {USER_ROLE_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl>
                <HStack justify='space-between'>
                  <FormLabel mb={0}>Trạng thái hoạt động</FormLabel>
                  <Switch
                    isChecked={formData.isActive}
                    onChange={e =>
                      handleInputChange('isActive', e.target.checked)
                    }
                    colorScheme='green'
                  />
                </HStack>
                <Text fontSize='sm' color='gray.600'>
                  {formData.isActive
                    ? 'Tài khoản đang hoạt động'
                    : 'Tài khoản bị vô hiệu hóa'}
                </Text>
              </FormControl>

              {/* Password Change Section */}
              <Divider />

              <FormControl>
                <HStack justify='space-between'>
                  <FormLabel mb={0}>Đổi mật khẩu</FormLabel>
                  <Switch
                    isChecked={showPasswordChange}
                    onChange={e => setShowPasswordChange(e.target.checked)}
                    colorScheme='blue'
                  />
                </HStack>
                <Text fontSize='sm' color='gray.600'>
                  {showPasswordChange
                    ? 'Bật chế độ đổi mật khẩu'
                    : 'Tắt chế độ đổi mật khẩu'}
                </Text>
              </FormControl>

              <Box w='full'>
                {' '}
                <Collapse in={showPasswordChange} animateOpacity>
                  <VStack spacing={4} align='stretch' w='full'>
                    {/* Show info message when admin is changing password for other account */}
                    {!isEditingOwnAccount && (
                      <Box
                        p={3}
                        bg='blue.50'
                        borderRadius='md'
                        border='1px'
                        borderColor='blue.200'
                      >
                        <Text fontSize='sm' color='blue.700'>
                          <strong>Lưu ý:</strong> Bạn đang đổi mật khẩu cho tài
                          khoản khác. Không cần nhập mật khẩu hiện tại của tài
                          khoản này.
                        </Text>
                      </Box>
                    )}

                    {/* Only show current password field if admin is editing their own account */}
                    <Box w='full'>
                      {isEditingOwnAccount && (
                        <FormControl isInvalid={!!errors.currentPassword}>
                          <FormLabel>Mật khẩu hiện tại</FormLabel>
                          <InputGroup>
                            <Input
                              type={showPasswords.current ? 'text' : 'password'}
                              value={passwordData.currentPassword}
                              onChange={e =>
                                handlePasswordChange(
                                  'currentPassword',
                                  e.target.value
                                )
                              }
                              placeholder='Nhập mật khẩu hiện tại'
                            />
                            <InputRightElement>
                              <IconButton
                                variant='ghost'
                                size='sm'
                                aria-label={
                                  showPasswords.current
                                    ? 'Ẩn mật khẩu'
                                    : 'Hiện mật khẩu'
                                }
                                icon={
                                  showPasswords.current ? (
                                    <EyeOff size={16} />
                                  ) : (
                                    <Eye size={16} />
                                  )
                                }
                                onClick={() =>
                                  togglePasswordVisibility('current')
                                }
                              />
                            </InputRightElement>
                          </InputGroup>
                          <FormErrorMessage>
                            {errors.currentPassword}
                          </FormErrorMessage>
                        </FormControl>
                      )}
                      <FormControl isInvalid={!!errors.newPassword}>
                        <FormLabel>Mật khẩu mới</FormLabel>
                        <InputGroup>
                          <Input
                            type={showPasswords.new ? 'text' : 'password'}
                            value={passwordData.newPassword}
                            onChange={e =>
                              handlePasswordChange(
                                'newPassword',
                                e.target.value
                              )
                            }
                            placeholder='Nhập mật khẩu mới'
                          />
                          <InputRightElement>
                            <IconButton
                              variant='ghost'
                              size='sm'
                              aria-label={
                                showPasswords.new
                                  ? 'Ẩn mật khẩu'
                                  : 'Hiện mật khẩu'
                              }
                              icon={
                                showPasswords.new ? (
                                  <EyeOff size={16} />
                                ) : (
                                  <Eye size={16} />
                                )
                              }
                              onClick={() => togglePasswordVisibility('new')}
                            />
                          </InputRightElement>
                        </InputGroup>
                        <FormErrorMessage>
                          {errors.newPassword}
                        </FormErrorMessage>
                      </FormControl>
                      <FormControl isInvalid={!!errors.confirmPassword}>
                        <FormLabel>Xác nhận mật khẩu mới</FormLabel>
                        <InputGroup>
                          <Input
                            type={showPasswords.confirm ? 'text' : 'password'}
                            value={passwordData.confirmPassword}
                            onChange={e =>
                              handlePasswordChange(
                                'confirmPassword',
                                e.target.value
                              )
                            }
                            placeholder='Nhập lại mật khẩu mới'
                          />
                          <InputRightElement>
                            <IconButton
                              variant='ghost'
                              size='sm'
                              aria-label={
                                showPasswords.confirm
                                  ? 'Ẩn mật khẩu'
                                  : 'Hiện mật khẩu'
                              }
                              icon={
                                showPasswords.confirm ? (
                                  <EyeOff size={16} />
                                ) : (
                                  <Eye size={16} />
                                )
                              }
                              onClick={() =>
                                togglePasswordVisibility('confirm')
                              }
                            />
                          </InputRightElement>
                        </InputGroup>
                        <FormErrorMessage>
                          {errors.confirmPassword}
                        </FormErrorMessage>
                      </FormControl>
                    </Box>
                  </VStack>
                </Collapse>
              </Box>
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
                isLoading={updateUserMutation.isPending}
                loadingText='Đang cập nhật...'
              >
                Cập nhật
              </Button>
            </HStack>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default EditUserModal;
