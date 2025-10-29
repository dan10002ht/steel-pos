import React, { useState, useEffect, useCallback } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  IconButton,
  Image,
  Box,
} from '@chakra-ui/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const PaymentImagePreviewModal = ({
  isOpen,
  onClose,
  images = [],
  initialIndex = 0,
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(initialIndex);

  // Reset selected index when modal opens with new images
  useEffect(() => {
    if (isOpen) {
      setSelectedImageIndex(initialIndex);
    }
  }, [isOpen, initialIndex]);

  const handlePrevImage = useCallback(() => {
    setSelectedImageIndex(prev => (prev > 0 ? prev - 1 : images.length - 1));
  }, [images.length]);

  const handleNextImage = useCallback(() => {
    setSelectedImageIndex(prev => (prev < images.length - 1 ? prev + 1 : 0));
  }, [images.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = e => {
      if (!isOpen) return;

      if (e.key === 'ArrowLeft') {
        handlePrevImage();
      } else if (e.key === 'ArrowRight') {
        handleNextImage();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handlePrevImage, handleNextImage, onClose]);

  if (!images || images.length === 0) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size='full' isCentered>
      <ModalOverlay bg='blackAlpha.900' />
      <ModalContent bg='transparent' boxShadow='none'>
        <ModalCloseButton
          color='white'
          bg='blackAlpha.600'
          _hover={{ bg: 'blackAlpha.800' }}
          size='lg'
          zIndex={3}
          top={4}
          right={4}
        />

        {/* Image counter */}
        {images.length > 1 && (
          <Box
            position='absolute'
            top={4}
            left='50%'
            transform='translateX(-50%)'
            bg='blackAlpha.600'
            color='white'
            px={4}
            py={2}
            borderRadius='md'
            fontSize='sm'
            fontWeight='medium'
            zIndex={3}
          >
            {selectedImageIndex + 1} / {images.length}
          </Box>
        )}

        <ModalBody
          p={0}
          display='flex'
          justifyContent='center'
          alignItems='center'
          position='relative'
        >
          {/* Previous button */}
          {images.length > 1 && (
            <IconButton
              icon={<ChevronLeft size={32} />}
              position='absolute'
              left={4}
              top='50%'
              transform='translateY(-50%)'
              onClick={handlePrevImage}
              colorScheme='whiteAlpha'
              bg='blackAlpha.600'
              _hover={{ bg: 'blackAlpha.800' }}
              size='lg'
              borderRadius='full'
              zIndex={2}
              aria-label='Previous image'
            />
          )}

          {/* Image */}
          {images[selectedImageIndex] && (
            <Image
              src={images[selectedImageIndex]}
              alt={`Hóa đơn thanh toán ${selectedImageIndex + 1}`}
              maxH='90vh'
              maxW='90vw'
              objectFit='contain'
              borderRadius='md'
            />
          )}

          {/* Next button */}
          {images.length > 1 && (
            <IconButton
              icon={<ChevronRight size={32} />}
              position='absolute'
              right={4}
              top='50%'
              transform='translateY(-50%)'
              onClick={handleNextImage}
              colorScheme='whiteAlpha'
              bg='blackAlpha.600'
              _hover={{ bg: 'blackAlpha.800' }}
              size='lg'
              borderRadius='full'
              zIndex={2}
              aria-label='Next image'
            />
          )}

          {/* Bottom navigation hint */}
          {images.length > 1 && (
            <Box
              position='absolute'
              bottom={4}
              left='50%'
              transform='translateX(-50%)'
              bg='blackAlpha.600'
              color='white'
              px={4}
              py={2}
              borderRadius='md'
              fontSize='xs'
              zIndex={3}
            >
              Dùng phím ← → để chuyển ảnh
            </Box>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default PaymentImagePreviewModal;
