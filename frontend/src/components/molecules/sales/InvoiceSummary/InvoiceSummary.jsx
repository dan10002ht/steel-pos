import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Select,
  Textarea,
  Divider,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Button,
  useToast,
} from '@chakra-ui/react';
import { Save, Printer } from 'lucide-react';
import { PAYMENT_METHODS } from '@/constants/options';
import { formatCurrency } from '@/utils';
import ImageUpload from '@/components/atoms/ImageUpload/ImageUpload';
import { fetchApi } from '@/shared/services/api';

const InvoiceSummary = ({
  invoice,
  onUpdateInvoice,
  onCreateInvoice,
  isDisabled = false,
  isLoading = false,
}) => {
  const toast = useToast();
  const [invoiceImages, setInvoiceImages] = useState(() => {
    // Parse existing invoice images if available
    if (invoice.invoiceImages) {
      try {
        const parsed = JSON.parse(invoice.invoiceImages);
        if (Array.isArray(parsed)) {
          // Support both formats for backward compatibility
          return parsed
            .map((item, index) => {
              if (typeof item === 'string') {
                // New format: array of URLs
                return {
                  id: Date.now() + index,
                  url: item,
                  isUploading: false,
                };
              } else if (item.url) {
                // Old format: array of objects with url and public_id
                return {
                  id: Date.now() + index,
                  url: item.url,
                  public_id: item.public_id,
                  isUploading: false,
                };
              }
              return null;
            })
            .filter(Boolean);
        }
      } catch {
        return [];
      }
    }
    return [];
  });

  const calculateSubtotal = () => {
    return invoice.items.reduce((sum, item) => sum + item.totalPrice, 0);
  };

  const calculateFinalAmount = () => {
    const subtotal = calculateSubtotal();
    const discount = invoice.discount || 0;
    return subtotal - discount;
  };

  const calculateRemainingAmount = () => {
    const totalAmount = calculateFinalAmount();
    const paidAmount = invoice.paidAmount || 0;
    return totalAmount - paidAmount;
  };

  // Handle invoice creation with images
  const handleCreateInvoice = async () => {
    // Prepare invoice data with images
    const invoiceWithImages = {
      ...invoice,
    };

    // Only include uploaded images (not still uploading)
    const uploadedImages = invoiceImages.filter(img => !img.isUploading);
    if (uploadedImages.length > 0) {
      // ✅ Chỉ lưu array of URLs (simple format)
      const imageUrls = uploadedImages.map(img => img.url);
      invoiceWithImages.invoiceImages = JSON.stringify(imageUrls);
    }

    await onCreateInvoice(invoiceWithImages);
  };

  const handleImageUpload = async (file, tempImage) => {
    // If no file provided, just add temp image to state (for preview)
    if (!file) {
      setInvoiceImages(prev => [...prev, tempImage]);
      return tempImage;
    }

    // Create FormData for upload
    const formData = new FormData();
    formData.append('images', file);

    try {
      // Upload images using fetchApi
      const response = await fetchApi({
        method: 'POST',
        url: '/images/upload',
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.success) {
        throw new Error(response.message || 'Upload failed');
      }

      // Get uploaded image data
      const uploadedImage = response.data.data.images[0];
      const uploadedImageData = {
        id: tempImage.id, // Keep same ID
        public_id: uploadedImage.public_id,
        url: uploadedImage.secure_url,
        name: uploadedImage.public_id.split('/').pop(),
        size: uploadedImage.size,
        isUploading: false,
        // Keep preview for smooth transition
        preview: tempImage.preview,
      };

      // Replace temp image with uploaded image in local state only
      setInvoiceImages(prev =>
        prev.map(img => (img.id === tempImage.id ? uploadedImageData : img))
      );

      // Clean up preview after transition
      setTimeout(() => {
        setInvoiceImages(prev =>
          prev.map(img =>
            img.id === tempImage.id ? { ...img, preview: undefined } : img
          )
        );
        if (tempImage.preview) {
          URL.revokeObjectURL(tempImage.preview);
        }
      }, 1000);

      // ✅ KHÔNG gọi onUpdateInvoice ở đây nữa
      // Images sẽ được attach vào invoice khi user nhấn "Tạo hóa đơn"

      return uploadedImageData;
    } catch (error) {
      console.error('Error uploading image:', error);

      // Remove failed image from state
      setInvoiceImages(prev => prev.filter(img => img.id !== tempImage.id));

      toast({
        title: 'Lỗi upload',
        description: error.message || 'Không thể upload hình ảnh',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });

      throw error;
    }
  };

  const handleImageRemove = index => {
    // Simply remove from local state
    setInvoiceImages(prev => prev.filter((_, i) => i !== index));

    // ✅ KHÔNG gọi onUpdateInvoice ở đây nữa
    // Images sẽ được attach vào invoice khi user nhấn "Tạo hóa đơn"
  };

  return (
    <VStack spacing={4} align='stretch'>
      <Text fontSize='lg' fontWeight='bold'>
        Thông tin hoá đơn
      </Text>

      <HStack justify='space-between'>
        <Text>Hình thức thanh toán:</Text>
        <Select
          value={invoice.paymentMethod || ''}
          onChange={e => onUpdateInvoice('paymentMethod', e.target.value)}
          maxW='200px'
        >
          <option value=''>Chọn hình thức</option>
          {PAYMENT_METHODS.map(method => (
            <option key={method.value} value={method.value}>
              {method.label}
            </option>
          ))}
        </Select>
      </HStack>

      <Box>
        <Text fontSize='sm' color='gray.600' mb={1}>
          Ghi chú (nội bộ)
        </Text>
        <Textarea
          value={invoice.notes || ''}
          onChange={e => onUpdateInvoice('notes', e.target.value)}
          placeholder='Nhập ghi chú nếu cần...'
          rows={3}
        />
      </Box>

      <Box>
        <Text fontSize='sm' color='gray.600' mb={2}>
          Hình ảnh minh chứng hóa đơn
        </Text>
        <ImageUpload
          images={invoiceImages}
          onUpload={handleImageUpload}
          onRemove={handleImageRemove}
          maxImages={10}
          maxSize={10 * 1024 * 1024} // 10MB
          acceptedTypes={['image/jpeg', 'image/png', 'image/gif', 'image/webp']}
          previewSize='100px'
          showUploadArea={true}
          disabled={isDisabled || isLoading}
        />
      </Box>

      <Divider />

      {/* Payment Summary */}
      <VStack spacing={2} align='stretch'>
        <HStack justify='space-between'>
          <Text>Thành tiền:</Text>
          <Text>{formatCurrency(calculateSubtotal())}</Text>
        </HStack>

        <HStack justify='space-between'>
          <Text>Giảm giá:</Text>
          <NumberInput
            value={invoice.discount || 0}
            min={0}
            max={calculateSubtotal()}
            onChange={value => onUpdateInvoice('discount', parseInt(value))}
            maxW='150px'
          >
            <NumberInputField />
          </NumberInput>
        </HStack>

        <Divider />

        <HStack justify='space-between'>
          <Text fontWeight='bold' fontSize='lg'>
            Tổng cộng:
          </Text>
          <Text fontWeight='bold' fontSize='lg' color='blue.500'>
            {formatCurrency(calculateFinalAmount())}
          </Text>
        </HStack>

        <Divider />

        {/* Payment Amount Fields */}
        <HStack justify='space-between'>
          <Text>Đã thanh toán:</Text>
          <NumberInput
            value={invoice.paidAmount || 0}
            min={0}
            max={calculateFinalAmount()}
            onChange={value => onUpdateInvoice('paidAmount', parseInt(value))}
            maxW='150px'
          >
            <NumberInputField />
          </NumberInput>
        </HStack>

        <HStack justify='space-between'>
          <Text
            fontWeight='bold'
            color={calculateRemainingAmount() > 0 ? 'red.500' : 'green.500'}
          >
            Còn lại:
          </Text>
          <Text
            fontWeight='bold'
            color={calculateRemainingAmount() > 0 ? 'red.500' : 'green.500'}
          >
            {formatCurrency(calculateRemainingAmount())}
          </Text>
        </HStack>
      </VStack>

      <HStack spacing={3}>
        <Button
          leftIcon={<Save size={16} />}
          colorScheme='blue'
          size='lg'
          onClick={() => handleCreateInvoice(false)}
          isDisabled={isDisabled}
          isLoading={isLoading}
          loadingText='Đang tạo...'
          flex={1}
        >
          Tạo hoá đơn
        </Button>
      </HStack>
    </VStack>
  );
};

export default InvoiceSummary;
