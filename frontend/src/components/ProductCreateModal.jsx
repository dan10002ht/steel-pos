import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  VStack,
  HStack,
  Text,
  useToast,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Textarea,
  Divider,
  Box,
} from '@chakra-ui/react';
import { Plus, Trash2 } from 'lucide-react';
import { useCreateProduct } from '../features/products/hooks/useProduct';

const ProductCreateModal = ({ isOpen, onClose, onProductCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    unit: '',
    notes: '',
    variants: [
      {
        id: null,
        name: '',
        stock: 0,
        price: 0,
        sold: 0,
      },
    ],
  });

  const [errors, setErrors] = useState({});
  const toast = useToast();

  const createProductMutation = useCreateProduct({
    onSuccess: data => {
      toast({
        title: 'Thành công!',
        description: 'Sản phẩm đã được tạo thành công.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      if (onProductCreated) {
        onProductCreated(data);
      }

      handleClose();
    },
    onError: error => {
      toast({
        title: 'Lỗi!',
        description:
          error.message || 'Không thể tạo sản phẩm. Vui lòng thử lại.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    },
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleVariantChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map((variant, i) =>
        i === index ? { ...variant, [field]: value } : variant
      ),
    }));
  };

  const addVariant = () => {
    setFormData(prev => ({
      ...prev,
      variants: [
        ...prev.variants,
        {
          id: null,
          name: '',
          stock: 0,
          price: 0,
          sold: 0,
        },
      ],
    }));
  };

  const removeVariant = index => {
    if (formData.variants.length > 1) {
      setFormData(prev => ({
        ...prev,
        variants: prev.variants.filter((_, i) => i !== index),
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate product name
    if (!formData.name.trim()) {
      newErrors.name = 'Tên sản phẩm là bắt buộc';
    }

    // Validate unit
    if (!formData.unit.trim()) {
      newErrors.unit = 'Đơn vị là bắt buộc';
    }

    // Validate variants
    const variantErrors = [];
    formData.variants.forEach((variant, index) => {
      const variantError = {};

      if (!variant.name.trim()) {
        variantError.name = 'Tên variant là bắt buộc';
      }

      if (variant.stock < 0) {
        variantError.stock = 'Số lượng tồn kho không được âm';
      }

      if (variant.price <= 0) {
        variantError.price = 'Giá phải lớn hơn 0';
      }

      if (Object.keys(variantError).length > 0) {
        variantErrors[index] = variantError;
      }
    });

    if (variantErrors.length > 0) {
      newErrors.variants = variantErrors;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      const productData = {
        ...formData,
        variants: formData.variants.map(variant => ({
          name: variant.name,
          sku: `${formData.name}-${variant.name}`
            .toLowerCase()
            .replace(/\s+/g, '-'), // Auto generate SKU
          stock: variant.stock,
          price: variant.price,
          unit: formData.unit, // Use product unit for all variants
        })),
      };

      createProductMutation.mutate(productData);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      unit: '',
      notes: '',
      variants: [
        {
          id: null,
          name: '',
          stock: 0,
          price: 0,
          sold: 0,
        },
      ],
    });
    setErrors({});
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size='xl'
      scrollBehavior='inside'
    >
      <ModalOverlay />
      <ModalContent maxW='800px'>
        <ModalHeader>Tạo sản phẩm mới</ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <VStack spacing={6} align='stretch'>
            {/* Product Information */}
            <Box>
              <Text fontSize='lg' fontWeight='bold' mb={4}>
                Thông tin sản phẩm
              </Text>
              <VStack spacing={4} align='stretch'>
                <FormControl isInvalid={!!errors.name} isRequired>
                  <FormLabel>Tên sản phẩm</FormLabel>
                  <Input
                    value={formData.name}
                    onChange={e => handleInputChange('name', e.target.value)}
                    placeholder='Nhập tên sản phẩm'
                  />
                  <FormErrorMessage>{errors.name}</FormErrorMessage>
                </FormControl>

                <HStack spacing={4}>
                  <FormControl isInvalid={!!errors.unit} isRequired>
                    <FormLabel>Đơn vị</FormLabel>
                    <Select
                      placeholder='Chọn đơn vị'
                      value={formData.unit}
                      onChange={e => handleInputChange('unit', e.target.value)}
                    >
                      <option value='m'>Mét (m)</option>
                      <option value='m²'>Mét vuông (m²)</option>
                      <option value='kg'>Kilogram (kg)</option>
                      <option value='cái'>Cái</option>
                      <option value='bộ'>Bộ</option>
                      <option value='cuộn'>Cuộn</option>
                      <option value='tấm'>Tấm</option>
                      <option value='ống'>Ống</option>
                    </Select>
                    <FormErrorMessage>{errors.unit}</FormErrorMessage>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Ghi chú</FormLabel>
                    <Textarea
                      value={formData.notes}
                      onChange={e => handleInputChange('notes', e.target.value)}
                      placeholder='Ghi chú về sản phẩm (tùy chọn)'
                      rows={3}
                    />
                  </FormControl>
                </HStack>
              </VStack>
            </Box>

            <Divider />

            {/* Variants */}
            <Box>
              <HStack justify='space-between' align='center' mb={4}>
                <Text fontSize='lg' fontWeight='bold'>
                  Phân loại sản phẩm
                </Text>
                <Button
                  leftIcon={<Plus size={16} />}
                  colorScheme='blue'
                  variant='outline'
                  onClick={addVariant}
                  size='sm'
                >
                  Thêm phân loại
                </Button>
              </HStack>

              <VStack spacing={4} align='stretch'>
                {formData.variants.map((variant, index) => (
                  <Box
                    key={index}
                    p={4}
                    border='1px'
                    borderColor='gray.200'
                    borderRadius='md'
                  >
                    <HStack justify='space-between' align='center' mb={3}>
                      <Text fontWeight='bold'>Phân loại {index + 1}</Text>
                      {formData.variants.length > 1 && (
                        <Button
                          size='sm'
                          colorScheme='red'
                          variant='ghost'
                          leftIcon={<Trash2 size={14} />}
                          onClick={() => removeVariant(index)}
                        >
                          Xóa
                        </Button>
                      )}
                    </HStack>

                    <VStack spacing={3} align='stretch'>
                      <FormControl
                        isInvalid={!!errors.variants?.[index]?.name}
                        isRequired
                      >
                        <FormLabel fontSize='sm'>Tên phân loại</FormLabel>
                        <Input
                          placeholder='Nhập tên phân loại'
                          value={variant.name}
                          onChange={e =>
                            handleVariantChange(index, 'name', e.target.value)
                          }
                        />
                        <FormErrorMessage>
                          {errors.variants?.[index]?.name}
                        </FormErrorMessage>
                      </FormControl>

                      <HStack spacing={3}>
                        <FormControl
                          isInvalid={!!errors.variants?.[index]?.stock}
                        >
                          <FormLabel fontSize='sm'>Tồn kho</FormLabel>
                          <NumberInput
                            value={variant.stock}
                            onChange={value =>
                              handleVariantChange(
                                index,
                                'stock',
                                parseInt(value) || 0
                              )
                            }
                            min={0}
                          >
                            <NumberInputField placeholder='0' />
                            <NumberInputStepper>
                              <NumberIncrementStepper />
                              <NumberDecrementStepper />
                            </NumberInputStepper>
                          </NumberInput>
                          <FormErrorMessage>
                            {errors.variants?.[index]?.stock}
                          </FormErrorMessage>
                        </FormControl>

                        <FormControl
                          isInvalid={!!errors.variants?.[index]?.price}
                          isRequired
                        >
                          <FormLabel fontSize='sm'>Giá</FormLabel>
                          <NumberInput
                            value={variant.price}
                            onChange={value =>
                              handleVariantChange(
                                index,
                                'price',
                                parseFloat(value) || 0
                              )
                            }
                            min={0}
                            precision={2}
                          >
                            <NumberInputField placeholder='0' />
                            <NumberInputStepper>
                              <NumberIncrementStepper />
                              <NumberDecrementStepper />
                            </NumberInputStepper>
                          </NumberInput>
                          <FormErrorMessage>
                            {errors.variants?.[index]?.price}
                          </FormErrorMessage>
                        </FormControl>
                      </HStack>
                    </VStack>
                  </Box>
                ))}
              </VStack>
            </Box>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant='ghost' mr={3} onClick={handleClose}>
            Hủy
          </Button>
          <Button
            colorScheme='blue'
            onClick={handleSubmit}
            isLoading={createProductMutation.isPending}
            loadingText='Đang tạo...'
          >
            Tạo sản phẩm
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ProductCreateModal;
