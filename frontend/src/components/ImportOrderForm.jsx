import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Button,
  FormControl,
  FormLabel,
  Input,
  Text,
  useToast,
  Card,
  CardBody,
  Divider,
  IconButton,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Select,
  InputGroup,
  InputRightElement,
  Badge,
  Flex,
  Spacer,
} from '@chakra-ui/react';
import { Plus, Trash2, Upload } from 'lucide-react';
import ProductCreateModal from './ProductCreateModal';
import ProductSearch from './ProductSearch';
import { useCreateApi } from '../hooks/useCreateApi';
import { formatCurrency } from '../utils/formatters';

const ImportOrderForm = ({
  onNavigateToList,
  isEditing = false,
  initialData = null,
  onSubmit = null,
  onCancel = null,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    importCode: `IMP${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}${String(Date.now()).slice(-4)}`,
    supplier: '',
    importDate: new Date().toISOString().split('T')[0],
    notes: '',
    documents: [],
  });

  const [products, setProducts] = useState([
    {
      id: Date.now(),
      productName: '',
      variant: '',
      unit: '',
      quantity: 0,
      unitPrice: 0,
      total: 0,
      productId: null,
      variantId: null,
      notes: '',
    },
  ]);

  const [errors, setErrors] = useState({});
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const toast = useToast();

  // Initialize form data when editing
  useEffect(() => {
    if (isEditing && initialData) {
      setFormData({
        importCode: initialData.importCode || formData.importCode,
        supplier: initialData.supplier || '',
        importDate: initialData.importDate
          ? new Date(initialData.importDate).toISOString().split('T')[0]
          : formData.importDate,
        notes: initialData.notes || '',
        documents: initialData.importImages || [],
      });

      if (initialData.products && initialData.products.length > 0) {
        const formattedProducts = initialData.products.map((item, index) => ({
          id: Date.now() + index,
          productName: item.name || '',
          variant: item.variant || '',
          unit: item.unit || '',
          quantity: item.quantity || 0,
          unitPrice: item.unitPrice || 0,
          total: (item.quantity || 0) * (item.unitPrice || 0),
          productId: item.productId || null,
          variantId: item.variantId || null,
          notes: item.notes || '',
        }));
        setProducts(formattedProducts);
      }
    }
  }, [isEditing, initialData]);

  // Create import order mutation using hook directly (only for create mode)
  const createMutation = useCreateApi('/import-orders', {
    invalidateQueries: [['import-orders']],
    onSuccess: () => {
      toast({
        title: 'Thành công',
        description: 'Đơn nhập hàng đã được tạo và gửi phê duyệt',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Navigate to list page
      if (onNavigateToList) {
        onNavigateToList();
      }
    },
    onError: error => {
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể tạo đơn nhập hàng',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    },
  });

  const calculateTotal = () => {
    return products.reduce((sum, product) => sum + product.total, 0);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleProductChange = (index, field, value) => {
    const updatedProducts = [...products];
    updatedProducts[index] = { ...updatedProducts[index], [field]: value };

    // Auto-calculate total for this product
    if (field === 'quantity' || field === 'unitPrice') {
      const quantity =
        field === 'quantity' ? value : updatedProducts[index].quantity;
      const unitPrice =
        field === 'unitPrice' ? value : updatedProducts[index].unitPrice;
      updatedProducts[index].total = quantity * unitPrice;
    }

    setProducts(updatedProducts);
  };

  const handleProductSelect = (index, selectedProduct) => {
    const updatedProducts = [...products];
    updatedProducts[index] = {
      ...updatedProducts[index],
      productName: selectedProduct.name,
      variant: selectedProduct.variants?.[0]?.name || '',
      unit: selectedProduct.unit,
      productId: selectedProduct.id,
      variantId: selectedProduct.variants?.[0]?.id || null,
      variants: selectedProduct.variants || [], // Lưu danh sách variants để chọn
    };

    // Auto-calculate total
    updatedProducts[index].total =
      updatedProducts[index].quantity * updatedProducts[index].unitPrice;

    setProducts(updatedProducts);
  };

  const handleVariantSelect = (index, selectedVariant) => {
    const updatedProducts = [...products];
    updatedProducts[index] = {
      ...updatedProducts[index],
      variant: selectedVariant.name,
      variantId: selectedVariant.id,
    };
    updatedProducts[index].total =
      updatedProducts[index].quantity * updatedProducts[index].unitPrice;
    setProducts(updatedProducts);
  };

  const addProduct = () => {
    setProducts([
      ...products,
      {
        id: Date.now(),
        productName: '',
        variant: '',
        unit: '',
        quantity: 0,
        unitPrice: 0,
        total: 0,
        productId: null,
        variantId: null,
        notes: '',
      },
    ]);
  };

  const removeProduct = index => {
    if (products.length > 1) {
      setProducts(products.filter((_, i) => i !== index));
    }
  };

  const handleFileUpload = event => {
    const files = Array.from(event.target.files);
    setFormData(prev => ({
      ...prev,
      documents: [...prev.documents, ...files],
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.supplier.trim()) {
      newErrors.supplier = 'Không được bỏ trống nhà cung cấp';
    }

    if (!formData.importDate) {
      newErrors.importDate = 'Không được bỏ trống ngày nhập kho';
    }

    // Documents are optional for now
    // if (formData.documents.length === 0) {
    //   newErrors.documents = "Không được bỏ trống chứng từ";
    // }

    // Check if at least one product is selected
    const hasProduct = products.some(
      product => product.productName && product.quantity > 0
    );
    if (!hasProduct) {
      newErrors.products = 'Không được bỏ trống sản phẩm';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProductCreated = () => {
    // Close modal
    setIsProductModalOpen(false);

    // Show success message
    toast({
      title: 'Thành công',
      description: 'Sản phẩm đã được tạo thành công',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng kiểm tra lại thông tin',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Transform frontend data to backend format
    const orderData = {
      supplier_name: formData.supplier,
      import_date: new Date(formData.importDate).toISOString(), // Convert to ISO format
      notes: formData.notes,
      import_images: formData.documents.map(file => file.name), // For now, just use file names
      items: products
        .filter(product => product.productName && product.quantity > 0)
        .map(product => ({
          product_id: product.productId || 1,
          variant_id: product.variantId || 1,
          product_name: product.productName,
          variant_name: product.variant,
          quantity: product.quantity,
          unit_price: product.unitPrice,
          unit: product.unit,
          notes: product.notes,
        })),
    };

    if (isEditing && onSubmit) {
      // Edit mode - call the provided onSubmit function
      onSubmit(orderData);
    } else {
      // Create mode - use the mutation
      createMutation.mutate(orderData);
    }
  };

  return (
    <>
      <VStack spacing={6} align='stretch'>
        {/* Import Order Details Section */}
        <Card>
          <CardBody>
            <VStack spacing={4} align='stretch'>
              <Flex flexDirection={{ base: 'column', md: 'row' }} gap={6}>
                {/* Import Code */}
                <FormControl>
                  <FormLabel fontWeight='bold'>Mã nhập kho</FormLabel>
                  <Input value={formData.importCode} isReadOnly bg='gray.50' />
                </FormControl>

                {/* Supplier */}
                <FormControl isInvalid={!!errors.supplier}>
                  <FormLabel fontWeight='bold'>Nhà cung cấp *</FormLabel>
                  <Input
                    placeholder='Nhập tên nhà cung cấp'
                    value={formData.supplier}
                    onChange={e =>
                      handleInputChange('supplier', e.target.value)
                    }
                  />
                  {errors.supplier && (
                    <Text color='red.500' fontSize='sm' mt={1}>
                      {errors.supplier}
                    </Text>
                  )}
                </FormControl>

                {/* Import Date */}
                <FormControl isInvalid={!!errors.importDate}>
                  <FormLabel fontWeight='bold'>Ngày nhập kho *</FormLabel>
                  <Input
                    type='date'
                    value={formData.importDate}
                    onChange={e =>
                      handleInputChange('importDate', e.target.value)
                    }
                  />
                  {errors.importDate && (
                    <Text color='red.500' fontSize='sm' mt={1}>
                      {errors.importDate}
                    </Text>
                  )}
                </FormControl>
              </Flex>

              {/* Documents */}
              <FormControl isInvalid={!!errors.documents}>
                <FormLabel fontWeight='bold'>Chứng từ kèm theo</FormLabel>
                <InputGroup>
                  <Input
                    type='file'
                    multiple
                    onChange={handleFileUpload}
                    accept='.pdf,.jpg,.jpeg,.png,.doc,.docx'
                    display='none'
                    id='file-upload'
                  />
                  <Input
                    placeholder='Chọn file chứng từ...'
                    value={formData.documents.map(f => f.name).join(', ') || ''}
                    isReadOnly
                    bg='gray.50'
                  />
                  <InputRightElement>
                    <IconButton
                      as='label'
                      htmlFor='file-upload'
                      icon={<Upload size={16} />}
                      variant='ghost'
                      size='sm'
                      cursor='pointer'
                    />
                  </InputRightElement>
                </InputGroup>
                {errors.documents && (
                  <Text color='red.500' fontSize='sm' mt={1}>
                    {errors.documents}
                  </Text>
                )}
              </FormControl>
            </VStack>
          </CardBody>
        </Card>

        {/* Products Section */}
        <Card>
          <CardBody>
            <HStack justify='space-between' align='center' mb={4}>
              <Heading size='md'>Sản phẩm</Heading>
              <HStack spacing={2}>
                <Button
                  leftIcon={<Plus size={16} />}
                  colorScheme='blue'
                  variant='outline'
                  onClick={addProduct}
                  size='sm'
                >
                  Thêm sản phẩm
                </Button>
                <Button
                  leftIcon={<Plus size={16} />}
                  colorScheme='green'
                  variant='outline'
                  onClick={() => setIsProductModalOpen(true)}
                  size='sm'
                >
                  Tạo sản phẩm mới
                </Button>
              </HStack>
            </HStack>

            <Table variant='simple'>
              <Thead>
                <Tr>
                  <Th>Tên sản phẩm</Th>
                  <Th>Phân loại</Th>
                  <Th>Số lượng</Th>
                  <Th>Đơn giá</Th>
                  <Th>Thành tiền</Th>
                  <Th>Thao tác</Th>
                </Tr>
              </Thead>
              <Tbody>
                {products.map((product, index) => (
                  <Tr key={product.id}>
                    <Td>
                      <VStack align='start' spacing={2}>
                        <ProductSearch
                          onSelect={selectedProduct =>
                            handleProductSelect(index, selectedProduct)
                          }
                          placeholder='Chọn sản phẩm'
                        />
                      </VStack>
                    </Td>
                    <Td>
                      <Select
                        placeholder='Chọn phân loại'
                        value={product.variant || ''}
                        onChange={e => {
                          const selectedVariant = product.variants.find(
                            v => v.name === e.target.value
                          );
                          if (selectedVariant) {
                            handleVariantSelect(index, selectedVariant);
                          }
                        }}
                        size='sm'
                      >
                        {product?.variants &&
                          product.variants.map(variant => (
                            <option key={variant.id} value={variant.name}>
                              {variant.name} - {variant.sku}
                            </option>
                          ))}
                      </Select>
                    </Td>
                    <Td>
                      <NumberInput
                        value={product.quantity}
                        onChange={value =>
                          handleProductChange(
                            index,
                            'quantity',
                            parseInt(value) || 0
                          )
                        }
                        min={0}
                        size='sm'
                      >
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </Td>
                    <Td>
                      <NumberInput
                        value={product.unitPrice}
                        onChange={value =>
                          handleProductChange(
                            index,
                            'unitPrice',
                            parseFloat(value) || 0
                          )
                        }
                        min={0}
                        size='sm'
                      >
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </Td>
                    <Td>
                      <Text fontWeight='bold' color='blue.600'>
                        {formatCurrency(product.total)}
                      </Text>
                    </Td>
                    <Td>
                      <IconButton
                        icon={<Trash2 size={14} />}
                        colorScheme='red'
                        variant='ghost'
                        size='sm'
                        onClick={() => removeProduct(index)}
                        isDisabled={products.length === 1}
                      />
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>

            {errors.products && (
              <Text color='red.500' fontSize='sm' mt={2}>
                {errors.products}
              </Text>
            )}

            <Divider my={4} />

            <Flex justify='space-between' align='center'>
              <Text fontSize='lg' fontWeight='bold'>
                Tổng cộng: {formatCurrency(calculateTotal())}
              </Text>
              <HStack spacing={3}>
                {onCancel && (
                  <Button
                    variant='outline'
                    onClick={onCancel}
                    isDisabled={isLoading}
                  >
                    Hủy
                  </Button>
                )}
                <Button
                  colorScheme='blue'
                  onClick={handleSubmit}
                  isLoading={isLoading || createMutation.isPending}
                  loadingText={isEditing ? 'Đang cập nhật...' : 'Đang tạo...'}
                >
                  {isEditing ? 'Cập nhật đơn nhập hàng' : 'Tạo đơn nhập hàng'}
                </Button>
              </HStack>
            </Flex>
          </CardBody>
        </Card>
      </VStack>

      {/* Product Create Modal */}
      <ProductCreateModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onProductCreated={handleProductCreated}
      />
    </>
  );
};

export default ImportOrderForm;
