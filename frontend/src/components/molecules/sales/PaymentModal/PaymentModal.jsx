import React, { useState, useCallback } from 'react';
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
  Input,
  Select,
  Textarea,
  VStack,
  HStack,
  Text,
  Alert,
  AlertIcon,
  AlertDescription,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Divider,
  Badge,
  Box,
  Image,
  IconButton,
  useToast,
} from '@chakra-ui/react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';

const PaymentModal = ({
  isOpen,
  onClose,
  invoice,
  onSubmit,
  isLoading = false,
  error = null,
}) => {
  const [formData, setFormData] = useState({
    amount: '',
    payment_method: 'cash',
    payment_date: new Date().toISOString().slice(0, 16), // YYYY-MM-DDTHH:MM format
    payment_images: [],
    notes: '',
  });

  const [errors, setErrors] = useState({});
  const [isDragOver, setIsDragOver] = useState(false);
  const toast = useToast();

  const paymentMethods = [
    { value: 'cash', label: 'Tiền mặt' },
    { value: 'card', label: 'Thẻ' },
    { value: 'bank_transfer', label: 'Chuyển khoản' },
    { value: 'credit', label: 'Ghi nợ' },
  ];

  const remainingAmount = invoice ? invoice.total_amount - invoice.paid_amount : 0;

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

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Số tiền phải lớn hơn 0';
    } else if (parseFloat(formData.amount) > remainingAmount) {
      newErrors.amount = `Số tiền không được vượt quá số tiền còn lại (${formatCurrency(remainingAmount)})`;
    }

    if (!formData.payment_method) {
      newErrors.payment_method = 'Vui lòng chọn phương thức thanh toán';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const paymentData = {
      amount: parseFloat(formData.amount),
      payment_method: formData.payment_method,
      payment_date: formData.payment_date ? new Date(formData.payment_date).toISOString() : null,
      payment_images: formData.payment_images.length > 0 ? JSON.stringify(formData.payment_images.map(img => ({
        public_id: img.public_id,
        url: img.url
      }))) : null,
      notes: formData.notes || null,
    };

    onSubmit(paymentData);
  };

  const handleClose = () => {
    setFormData({
      amount: '',
      payment_method: 'cash',
      payment_date: new Date().toISOString().slice(0, 16),
      payment_images: [],
      notes: '',
    });
    setErrors({});
    onClose();
  };

  const handlePayFull = () => {
    setFormData(prev => ({
      ...prev,
      amount: remainingAmount.toString(),
    }));
  };

  const handleImageUpload = async (files) => {
    const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng chọn file hình ảnh hợp lệ',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Create FormData for upload
    const uploadFormData = new FormData();
    imageFiles.forEach(file => {
      uploadFormData.append('images', file);
    });

    try {
      // Upload images to backend
      const response = await fetch('/api/images/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: uploadFormData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      
      // Add uploaded images to form data
      const uploadedImages = data.data.images.map(img => ({
        public_id: img.public_id,
        url: img.secure_url,
        name: img.public_id.split('/').pop(),
        size: img.size
      }));

      setFormData(prev => ({
        ...prev,
        payment_images: [...prev.payment_images, ...uploadedImages]
      }));

      toast({
        title: 'Thành công',
        description: `Đã tải lên ${uploadedImages.length} hình ảnh`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error uploading images:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tải lên hình ảnh. Vui lòng thử lại.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleFileInputChange = (event) => {
    handleImageUpload(event.target.files);
  };

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    handleImageUpload(e.dataTransfer.files);
  }, []);

  const handleRemoveImage = (index) => {
    setFormData(prev => ({
      ...prev,
      payment_images: prev.payment_images.filter((_, i) => i !== index)
    }));
  };

  if (!invoice) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <VStack align="stretch" spacing={2}>
            <Text fontSize="lg" fontWeight="bold">
              Thanh toán hóa đơn
            </Text>
            <HStack justify="space-between">
              <Text fontSize="sm" color="gray.600">
                Mã hóa đơn: {invoice.invoice_code}
              </Text>
              <Badge colorScheme="blue" fontSize="xs">
                {invoice.status}
              </Badge>
            </HStack>
          </VStack>
        </ModalHeader>
        <ModalCloseButton />
        
        <form onSubmit={handleSubmit}>
          <ModalBody>
            <VStack spacing={4} align="stretch">
              {/* Invoice Summary */}
              <Box p={4} bg="gray.50" borderRadius="md">
                <VStack spacing={2} align="stretch">
                  <HStack justify="space-between">
                    <Text fontSize="sm" color="gray.600">Tổng tiền hóa đơn:</Text>
                    <Text fontWeight="medium">{formatCurrency(invoice.total_amount)}</Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text fontSize="sm" color="gray.600">Đã thanh toán:</Text>
                    <Text fontWeight="medium" color="green.600">
                      {formatCurrency(invoice.paid_amount)}
                    </Text>
                  </HStack>
                  <Divider />
                  <HStack justify="space-between">
                    <Text fontSize="md" fontWeight="bold" color="red.600">
                      Còn lại:
                    </Text>
                    <Text fontSize="lg" fontWeight="bold" color="red.600">
                      {formatCurrency(remainingAmount)}
                    </Text>
                  </HStack>
                </VStack>
              </Box>

              {error && (
                <Alert status="error" borderRadius="md">
                  <AlertIcon />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Payment Form */}
              <VStack spacing={4} align="stretch">
                <FormControl isRequired isInvalid={!!errors.amount}>
                  <FormLabel>Số tiền thanh toán</FormLabel>
                  <HStack>
                    <NumberInput
                      value={formData.amount}
                      onChange={(value) => handleInputChange('amount', value)}
                      min={0}
                      max={remainingAmount}
                      precision={2}
                      flex={1}
                    >
                      <NumberInputField placeholder="Nhập số tiền" />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handlePayFull}
                      isDisabled={remainingAmount <= 0}
                    >
                      Trả đủ
                    </Button>
                  </HStack>
                  {errors.amount && (
                    <Text fontSize="sm" color="red.500" mt={1}>
                      {errors.amount}
                    </Text>
                  )}
                </FormControl>

                <FormControl isRequired isInvalid={!!errors.payment_method}>
                  <FormLabel>Phương thức thanh toán</FormLabel>
                  <Select
                    value={formData.payment_method}
                    onChange={(e) => handleInputChange('payment_method', e.target.value)}
                  >
                    {paymentMethods.map((method) => (
                      <option key={method.value} value={method.value}>
                        {method.label}
                      </option>
                    ))}
                  </Select>
                  {errors.payment_method && (
                    <Text fontSize="sm" color="red.500" mt={1}>
                      {errors.payment_method}
                    </Text>
                  )}
                </FormControl>

                <FormControl>
                  <FormLabel>Ngày thanh toán</FormLabel>
                  <Input
                    type="datetime-local"
                    value={formData.payment_date}
                    onChange={(e) => handleInputChange('payment_date', e.target.value)}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Hình ảnh minh chứng thanh toán</FormLabel>
                  <VStack spacing={3} align="stretch">
                    {/* Dropzone */}
                    <Box
                      border="2px dashed"
                      borderColor={isDragOver ? "blue.400" : "gray.300"}
                      borderRadius="lg"
                      p={6}
                      textAlign="center"
                      bg={isDragOver ? "blue.50" : "gray.50"}
                      transition="all 0.2s"
                      cursor="pointer"
                      _hover={{
                        borderColor: "blue.400",
                        bg: "blue.50"
                      }}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => document.getElementById('payment-image-upload').click()}
                    >
                      <VStack spacing={3}>
                        <ImageIcon size={32} color={isDragOver ? "#3182ce" : "#718096"} />
                        <VStack spacing={1}>
                          <Text fontSize="md" fontWeight="medium" color={isDragOver ? "blue.600" : "gray.600"}>
                            {isDragOver ? "Thả hình ảnh vào đây" : "Kéo thả hình ảnh vào đây"}
                          </Text>
                          <Text fontSize="sm" color="gray.500">
                            hoặc click để chọn file
                          </Text>
                        </VStack>
                        <Text fontSize="xs" color="gray.400">
                          Hỗ trợ: JPG, PNG, GIF (tối đa 10MB mỗi file)
                        </Text>
                      </VStack>
                    </Box>

                    {/* Hidden file input */}
                    <Input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileInputChange}
                      display="none"
                      id="payment-image-upload"
                    />

                    {/* Image Preview Slider */}
                    {formData.payment_images.length > 0 && (
                      <Box>
                        <HStack justify="space-between" mb={3}>
                          <Text fontSize="sm" fontWeight="medium">
                            Hình ảnh đã tải lên ({formData.payment_images.length})
                          </Text>
                          <Button
                            size="xs"
                            variant="outline"
                            leftIcon={<Upload size={12} />}
                            onClick={() => document.getElementById('payment-image-upload').click()}
                          >
                            Thêm hình
                          </Button>
                        </HStack>
                        
                        {/* Horizontal scrollable container */}
                        <Box
                          overflowX="auto"
                          overflowY="hidden"
                          css={{
                            '&::-webkit-scrollbar': {
                              height: '6px',
                            },
                            '&::-webkit-scrollbar-track': {
                              background: '#f1f1f1',
                              borderRadius: '3px',
                            },
                            '&::-webkit-scrollbar-thumb': {
                              background: '#c1c1c1',
                              borderRadius: '3px',
                            },
                            '&::-webkit-scrollbar-thumb:hover': {
                              background: '#a8a8a8',
                            },
                          }}
                        >
                          <HStack spacing={3} align="flex-start" pb={2}>
                            {formData.payment_images.map((image, index) => (
                              <Box key={index} position="relative" flexShrink={0}>
                                <Image
                                  src={image.url || image.preview}
                                  alt={`Payment proof ${index + 1}`}
                                  boxSize="120px"
                                  objectFit="cover"
                                  borderRadius="md"
                                  border="1px solid"
                                  borderColor="gray.200"
                                  _hover={{
                                    borderColor: "blue.300",
                                    transform: "scale(1.02)",
                                    transition: "all 0.2s"
                                  }}
                                />
                                <IconButton
                                  icon={<X size={12} />}
                                  size="xs"
                                  colorScheme="red"
                                  variant="solid"
                                  position="absolute"
                                  top="-6px"
                                  right="-6px"
                                  borderRadius="full"
                                  onClick={() => handleRemoveImage(index)}
                                  aria-label="Xóa hình ảnh"
                                  _hover={{
                                    transform: "scale(1.1)"
                                  }}
                                />
                                <Text
                                  fontSize="xs"
                                  color="gray.500"
                                  mt={1}
                                  textAlign="center"
                                  noOfLines={1}
                                  maxW="120px"
                                >
                                  {image.name}
                                </Text>
                              </Box>
                            ))}
                          </HStack>
                        </Box>
                      </Box>
                    )}
                  </VStack>
                </FormControl>

                <FormControl>
                  <FormLabel>Ghi chú</FormLabel>
                  <Textarea
                    placeholder="Nhập ghi chú (nếu có)"
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    rows={3}
                  />
                </FormControl>
              </VStack>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <HStack spacing={3}>
              <Button variant="ghost" onClick={handleClose} isDisabled={isLoading}>
                Hủy
              </Button>
              <Button
                type="submit"
                colorScheme="blue"
                isLoading={isLoading}
                loadingText="Đang xử lý..."
                isDisabled={remainingAmount <= 0}
              >
                Xác nhận thanh toán
              </Button>
            </HStack>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default PaymentModal;
