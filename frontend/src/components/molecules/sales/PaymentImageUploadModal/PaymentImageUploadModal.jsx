import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  VStack,
  Text,
  useToast,
} from '@chakra-ui/react';
import ImageUpload from '../../../atoms/ImageUpload/ImageUpload';
import { fetchApi } from '@/shared/services/api';

const PaymentImageUploadModal = ({ isOpen, onClose, payment, onSuccess }) => {
  const [images, setImages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const toast = useToast();

  const handleImageUpload = async (file, tempImage) => {
    // If no file provided, just add temp image to state (for preview)
    if (!file) {
      setImages(prev => [...prev, tempImage]);
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
        id: tempImage.id,
        public_id: uploadedImage.public_id,
        url: uploadedImage.secure_url,
        name: uploadedImage.public_id.split('/').pop(),
        size: uploadedImage.size,
        isUploading: false,
      };

      // Replace temp image with uploaded image
      setImages(prev =>
        prev.map(img => (img.id === tempImage.id ? uploadedImageData : img))
      );

      return uploadedImageData;
    } catch (error) {
      console.error('Error uploading image:', error);

      // Remove failed image from state
      setImages(prev => prev.filter(img => img.id !== tempImage.id));

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
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (images.length === 0) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng tải lên ít nhất 1 hình ảnh',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Check if any images are still uploading
    const hasUploadingImages = images.some(img => img.isUploading);
    if (hasUploadingImages) {
      toast({
        title: 'Đang upload',
        description: 'Vui lòng đợi hình ảnh upload xong',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsUploading(true);

    try {
      // Prepare payment images data
      const paymentImagesData = images.map(img => ({
        url: img.url,
        public_id: img.public_id,
      }));

      // Update payment with images
      const response = await fetchApi({
        method: 'PUT',
        url: `/invoice-payments/${payment.id}`,
        data: {
          payment_images: JSON.stringify(paymentImagesData),
        },
      });

      if (!response.success) {
        throw new Error(response.message || 'Update failed');
      }

      toast({
        title: 'Thành công',
        description: 'Đã cập nhật hình ảnh minh chứng',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Reset form and close modal
      setImages([]);
      onClose();

      // Call success callback to refresh data
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error updating payment images:', error);
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể cập nhật hình ảnh',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setImages([]);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size='xl'>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Bổ sung hóa đơn thanh toán</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align='stretch'>
            <Text fontSize='sm' color='gray.600'>
              Thanh toán: {payment?.amount?.toLocaleString('vi-VN')} đ
            </Text>
            <Text fontSize='sm' color='gray.600'>
              Ngày:{' '}
              {payment?.payment_date
                ? new Date(payment.payment_date).toLocaleString('vi-VN')
                : '-'}
            </Text>
            <Text fontSize='sm' fontWeight='medium' mb={2}>
              Hình ảnh minh chứng{' '}
              <Text as='span' color='red.500'>
                *
              </Text>
            </Text>
            <ImageUpload
              images={images}
              onUpload={handleImageUpload}
              onRemove={handleImageRemove}
              maxImages={10}
              maxSize={10 * 1024 * 1024} // 10MB
              acceptedTypes={[
                'image/jpeg',
                'image/png',
                'image/gif',
                'image/webp',
              ]}
              previewSize='100px'
              showUploadArea={true}
              disabled={isUploading}
            />
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button
            variant='ghost'
            mr={3}
            onClick={handleClose}
            isDisabled={isUploading}
          >
            Hủy
          </Button>
          <Button
            colorScheme='blue'
            onClick={handleSubmit}
            isLoading={isUploading}
            loadingText='Đang lưu...'
          >
            Lưu
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default PaymentImageUploadModal;
