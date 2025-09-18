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
  VStack,
  HStack,
  Alert,
  AlertIcon,
  AlertDescription,
  useToast,
} from '@chakra-ui/react';
import { fetchApi } from '@/shared/services/api';
import PaymentModalHeader from '@/components/molecules/PaymentModalHeader';
import InvoiceSummary from '@/components/molecules/InvoiceSummary';
import PaymentForm from '@/components/molecules/PaymentForm';

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

  const handleImageUpload = async (file, tempImage) => {
    // If no file provided, just add temp image to state (for preview)
    if (!file) {
      setFormData(prev => ({
        ...prev,
        payment_images: [...prev.payment_images, tempImage]
      }));
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
        // Keep preview for now, will be cleaned up later
        preview: tempImage.preview,
      };

      // Replace temp image with uploaded image
      setFormData(prev => ({
        ...prev,
        payment_images: prev.payment_images.map(img => 
          img.id === tempImage.id ? uploadedImageData : img
        )
      }));

      // Clean up preview after a short delay to allow smooth transition
      setTimeout(() => {
        setFormData(prev => ({
          ...prev,
          payment_images: prev.payment_images.map(img => 
            img.id === tempImage.id ? { ...img, preview: undefined } : img
          )
        }));
        URL.revokeObjectURL(tempImage.preview);
      }, 1000);

      return uploadedImageData;
    } catch (error) {
      console.error('Error uploading images:', error);
      
      // Remove failed image from state
      setFormData(prev => ({
        ...prev,
        payment_images: prev.payment_images.filter(img => img.id !== tempImage.id)
      }));
      
      throw error;
    }
  };

  const handleImageRemove = (index) => {
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
          <PaymentModalHeader invoice={invoice} />
        </ModalHeader>
        <ModalCloseButton />
        
        <form onSubmit={handleSubmit}>
          <ModalBody>
            <VStack spacing={4} align="stretch">
              {/* Invoice Summary */}
              <InvoiceSummary invoice={invoice} />

              {error && (
                <Alert status="error" borderRadius="md">
                  <AlertIcon />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Payment Form */}
              <PaymentForm
                formData={formData}
                errors={errors}
                remainingAmount={remainingAmount}
                onInputChange={handleInputChange}
                onPayFull={handlePayFull}
                onImageUpload={handleImageUpload}
                onImageRemove={handleImageRemove}
                isLoading={isLoading}
                disabled={isLoading}
              />
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
