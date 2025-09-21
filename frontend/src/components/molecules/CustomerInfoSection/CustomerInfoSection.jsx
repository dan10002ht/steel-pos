import React, { useState } from "react";
import { 
  Card, 
  CardHeader, 
  CardBody, 
  VStack, 
  HStack, 
  Divider, 
  Box, 
  Text, 
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Textarea,
  Switch,
  useToast,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton
} from "@chakra-ui/react";
import { Edit, Save, X } from "lucide-react";
import InfoField from "../../atoms/InfoField";
import { formatDateTime, formatPhoneNumber } from "../../../utils/formatters";
import { useEditApi } from "../../../hooks/useEditApi";

const CustomerInfoSection = ({ customer, onCustomerUpdate }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    phone: customer?.phone || '',
    name: customer?.name || '',
    address: customer?.address || '',
    is_active: customer?.is_active !== undefined ? customer.is_active : true,
  });
  const [errors, setErrors] = useState({});

  // Edit customer mutation
  const editCustomerMutation = useEditApi("/customers", {
    invalidateQueries: [["customers"], ["customer", customer?.id]],
    onSuccess: () => {
      toast({
        title: "Thành công!",
        description: "Thông tin khách hàng đã được cập nhật thành công.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setIsEditing(false);
      onCustomerUpdate?.();
    },
    onError: (error) => {
      toast({
        title: "Lỗi!",
        description: error.message || "Không thể cập nhật thông tin khách hàng. Vui lòng thử lại.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    },
  });

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

  const handleEdit = () => {
    setFormData({
      phone: customer.phone || '',
      name: customer.name || '',
      address: customer.address || '',
      is_active: customer.is_active !== undefined ? customer.is_active : true,
    });
    setErrors({});
    setIsEditing(true);
  };

  const handleCancel = () => {
    setFormData({
      phone: customer.phone || '',
      name: customer.name || '',
      address: customer.address || '',
      is_active: customer.is_active !== undefined ? customer.is_active : true,
    });
    setErrors({});
    setIsEditing(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await editCustomerMutation.mutateAsync({
        id: customer.id,
        data: {
          phone: formData.phone.trim(),
          name: formData.name.trim(),
          address: formData.address.trim() || null,
          is_active: formData.is_active,
        },
      });
    } catch (error) {
      console.error("Error updating customer:", error);
    }
  };

  if (isEditing) {
    return (
      <Card>
        <CardHeader>
          <HStack justify="space-between" align="center">
            <Text fontSize="lg" fontWeight="bold">
              Chỉnh sửa thông tin khách hàng
            </Text>
            <HStack spacing={2}>
              <Button
                size="sm"
                variant="outline"
                leftIcon={<X size={16} />}
                onClick={handleCancel}
                isDisabled={editCustomerMutation.isPending}
              >
                Hủy
              </Button>
              <Button
                size="sm"
                colorScheme="blue"
                leftIcon={<Save size={16} />}
                onClick={handleSubmit}
                isLoading={editCustomerMutation.isPending}
                loadingText="Đang lưu..."
              >
                Lưu
              </Button>
            </HStack>
          </HStack>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit}>
            <VStack spacing={4} align="stretch">
              <HStack spacing={4} align="start">
                <FormControl isInvalid={!!errors.name} flex={1}>
                  <FormLabel fontWeight="medium">
                    Tên khách hàng <Text as="span" color="red.500">*</Text>
                  </FormLabel>
                  <Input
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    isDisabled={editCustomerMutation.isPending}
                  />
                  <FormErrorMessage>{errors.name}</FormErrorMessage>
                </FormControl>
                <Box flex={1}>
                  <InfoField 
                    label="ID khách hàng" 
                    value={`#${customer.id}`}
                    isMonospace
                  />
                </Box>
              </HStack>

              <Divider />

              <HStack spacing={4} align="start">
                <FormControl isInvalid={!!errors.phone} flex={1}>
                  <FormLabel fontWeight="medium">
                    Số điện thoại <Text as="span" color="red.500">*</Text>
                  </FormLabel>
                  <Input
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    isDisabled={editCustomerMutation.isPending}
                  />
                  <FormErrorMessage>{errors.phone}</FormErrorMessage>
                </FormControl>
                <Box flex={1}>
                  <InfoField 
                    label="Ngày tạo" 
                    value={formatDateTime(customer.created_at)}
                  />
                </Box>
              </HStack>

              <Divider />

              <FormControl>
                <FormLabel fontWeight="medium">Địa chỉ</FormLabel>
                <Textarea
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  isDisabled={editCustomerMutation.isPending}
                  rows={3}
                />
              </FormControl>

              <Divider />

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
                  isDisabled={editCustomerMutation.isPending}
                  colorScheme="green"
                />
              </HStack>

              <Divider />

              <HStack spacing={4} align="start">
                <InfoField 
                  label="Cập nhật lần cuối" 
                  value={formatDateTime(customer.updated_at)}
                />
                <InfoField 
                  label="Người tạo" 
                  value={customer.created_by ? `User #${customer.created_by}` : 'Hệ thống'}
                />
              </HStack>
            </VStack>
          </form>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <HStack justify="space-between" align="center">
          <Text fontSize="lg" fontWeight="bold">
            Thông tin khách hàng
          </Text>
          <Button
            size="sm"
            variant="outline"
            leftIcon={<Edit size={16} />}
            onClick={handleEdit}
          >
            Chỉnh sửa
          </Button>
        </HStack>
      </CardHeader>
      <CardBody>
        <VStack spacing={4} align="stretch">
          <HStack spacing={4} align="start">
            <InfoField 
              label="Tên khách hàng" 
              value={customer.name}
            />
            <InfoField 
              label="ID khách hàng" 
              value={`#${customer.id}`}
              isMonospace
            />
          </HStack>

          <Divider />

          <HStack spacing={4} align="start">
            <InfoField 
              label="Số điện thoại" 
              value={formatPhoneNumber(customer.phone)}
              isMonospace
            />
            <InfoField 
              label="Ngày tạo" 
              value={formatDateTime(customer.created_at)}
            />
          </HStack>

          {customer.address && (
            <>
              <Divider />
              <Box>
                <Text fontSize="sm" color="gray.600">
                  Địa chỉ
                </Text>
                <Text fontSize="md">
                  {customer.address}
                </Text>
              </Box>
            </>
          )}

          <Divider />

          <HStack spacing={4} align="start">
            <InfoField 
              label="Cập nhật lần cuối" 
              value={formatDateTime(customer.updated_at)}
            />
            <InfoField 
              label="Người tạo" 
              value={customer.created_by ? `User #${customer.created_by}` : 'Hệ thống'}
            />
          </HStack>
        </VStack>
      </CardBody>
    </Card>
  );
};

export default CustomerInfoSection;
