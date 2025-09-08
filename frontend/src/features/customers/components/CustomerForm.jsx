import React from 'react';
import {
  Box,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Textarea,
  Button,
  Card,
  CardBody,
  CardHeader,
  Text,
  Switch,
} from '@chakra-ui/react';
import { ArrowLeft, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CustomerForm = ({
  customer = null,
  onSubmit,
  isLoading = false,
  title = 'Tạo khách hàng mới',
  submitText = 'Tạo khách hàng',
}) => {
  const navigate = useNavigate();
  const [formData, setFormData] = React.useState({
    phone: customer?.phone || '',
    name: customer?.name || '',
    address: customer?.address || '',
    is_active: customer?.is_active !== undefined ? customer.is_active : true,
  });

  const [errors, setErrors] = React.useState({});

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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.phone.trim()) {
      newErrors.phone = 'Số điện thoại là bắt buộc';
    } else if (!/^[0-9+\-\s()]+$/.test(formData.phone.trim())) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Tên khách hàng là bắt buộc';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Prepare data for submission
    const submitData = {
      phone: formData.phone.trim(),
      name: formData.name.trim(),
      address: formData.address.trim() || null,
      is_active: formData.is_active,
    };

    onSubmit(submitData);
  };

  return (
    <Box maxW="2xl" mx="auto">
      <Card shadow="sm">
        <CardHeader>
          <HStack justify="space-between" align="center">
            <VStack align="start" spacing={1}>
              <Text fontSize="xl" fontWeight="bold">
                {title}
              </Text>
              <Text fontSize="sm" color="gray.600">
                {customer ? 'Cập nhật thông tin khách hàng' : 'Nhập thông tin khách hàng mới'}
              </Text>
            </VStack>
            <Button
              variant="ghost"
              leftIcon={<ArrowLeft size={16} />}
              onClick={() => navigate(-1)}
            >
              Quay lại
            </Button>
          </HStack>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit}>
            <VStack spacing={6} align="stretch">
              {/* Phone Number */}
              <FormControl isInvalid={!!errors.phone}>
                <FormLabel fontWeight="medium">
                  Số điện thoại <Text as="span" color="red.500">*</Text>
                </FormLabel>
                <Input
                  placeholder="Nhập số điện thoại"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  isDisabled={isLoading}
                />
                <FormErrorMessage>{errors.phone}</FormErrorMessage>
              </FormControl>

              {/* Customer Name */}
              <FormControl isInvalid={!!errors.name}>
                <FormLabel fontWeight="medium">
                  Tên khách hàng <Text as="span" color="red.500">*</Text>
                </FormLabel>
                <Input
                  placeholder="Nhập tên khách hàng"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  isDisabled={isLoading}
                />
                <FormErrorMessage>{errors.name}</FormErrorMessage>
              </FormControl>

              {/* Address */}
              <FormControl>
                <FormLabel fontWeight="medium">Địa chỉ</FormLabel>
                <Textarea
                  placeholder="Nhập địa chỉ (tùy chọn)"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  isDisabled={isLoading}
                  rows={3}
                />
              </FormControl>

              {/* Active Status */}
              <FormControl>
                <HStack justify="space-between" align="center">
                  <Box>
                    <FormLabel fontWeight="medium" mb={1}>
                      Trạng thái hoạt động
                    </FormLabel>
                    <Text fontSize="sm" color="gray.600">
                      Khách hàng có thể sử dụng hệ thống
                    </Text>
                  </Box>
                  <Switch
                    isChecked={formData.is_active}
                    onChange={(e) => handleInputChange('is_active', e.target.checked)}
                    isDisabled={isLoading}
                    colorScheme="green"
                  />
                </HStack>
              </FormControl>

              {/* Submit Button */}
              <HStack justify="flex-end" spacing={4} pt={4}>
                <Button
                  variant="outline"
                  onClick={() => navigate(-1)}
                  isDisabled={isLoading}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  colorScheme="blue"
                  leftIcon={<Save size={16} />}
                  isLoading={isLoading}
                  loadingText={customer ? 'Đang cập nhật...' : 'Đang tạo...'}
                >
                  {submitText}
                </Button>
              </HStack>
            </VStack>
          </form>
        </CardBody>
      </Card>
    </Box>
  );
};

export default CustomerForm;

