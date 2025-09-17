import React, { useState, useCallback } from 'react';
import {
  Box,
  Image,
  IconButton,
  Text,
  HStack,
  VStack,
  Spinner,
  useToast,
  Button,
} from '@chakra-ui/react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

const ImageUpload = ({
  images = [],
  onUpload,
  onRemove,
  maxImages = 10,
  maxSize = 10 * 1024 * 1024, // 10MB
  acceptedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  previewSize = '120px',
  showUploadArea = true,
  disabled = false,
  ...props
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(new Set());
  const toast = useToast();

  const validateFile = (file) => {
    if (!acceptedTypes.includes(file.type)) {
      return { valid: false, error: 'Loại file không được hỗ trợ' };
    }
    if (file.size > maxSize) {
      return { valid: false, error: `File quá lớn (tối đa ${Math.round(maxSize / 1024 / 1024)}MB)` };
    }
    return { valid: true };
  };

  const handleFileSelect = async (files) => {
    if (disabled) return;

    const fileList = Array.from(files);
    const imageFiles = fileList.filter(file => file.type.startsWith('image/'));

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

    if (images.length + imageFiles.length > maxImages) {
      toast({
        title: 'Lỗi',
        description: `Chỉ được tải lên tối đa ${maxImages} hình ảnh`,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Validate files
    for (const file of imageFiles) {
      const validation = validateFile(file);
      if (!validation.valid) {
        toast({
          title: 'Lỗi',
          description: validation.error,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }
    }

    // Process files - add preview immediately for all files
    const tempImages = [];
    for (const file of imageFiles) {
      const tempId = `temp_${Date.now()}_${Math.random()}`;
      const tempImage = {
        id: tempId,
        file,
        preview: URL.createObjectURL(file),
        name: file.name,
        size: file.size,
        isUploading: true,
      };
      tempImages.push(tempImage);
    }

    // Add all temp images to parent state immediately for preview
    if (onUpload) {
      for (const tempImage of tempImages) {
        onUpload(null, tempImage);
      }
    }

    // Upload all files in parallel
    const uploadPromises = tempImages.map(async (tempImage) => {
      // Add to uploading set
      setUploadingImages(prev => new Set([...prev, tempImage.id]));

      try {
        // Call onUpload with file for actual upload
        const result = await onUpload(tempImage.file, tempImage);
        console.log('result', result);
        
        // Remove from uploading set
        setUploadingImages(prev => {
          const newSet = new Set(prev);
          newSet.delete(tempImage.id);
          return newSet;
        });

        // Clean up object URL
        URL.revokeObjectURL(tempImage.preview);
        return result;
      } catch (error) {
        // Remove from uploading set on error
        setUploadingImages(prev => {
          const newSet = new Set(prev);
          newSet.delete(tempImage.id);
          return newSet;
        });
        
        // Clean up object URL
        URL.revokeObjectURL(tempImage.preview);
        
        console.error('Upload error:', error);
        toast({
          title: 'Lỗi',
          description: error.message || 'Không thể tải lên hình ảnh',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        throw error;
      }
    });

    // Wait for all uploads to complete
    try {
      await Promise.all(uploadPromises);
      toast({
        title: 'Thành công',
        description: `Đã tải lên ${imageFiles.length} hình ảnh`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      // Individual errors are already handled above
      console.error('Some uploads failed:', error);
    }
  };

  const handleFileInputChange = (event) => {
    handleFileSelect(event.target.files);
  };

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (!disabled) {
      handleFileSelect(e.dataTransfer.files);
    }
  }, [disabled]);

  const handleRemove = (index) => {
    if (!disabled && onRemove) {
      onRemove(index);
    }
  };

  const isUploading = uploadingImages.size > 0;

  return (
    <VStack spacing={3} align="stretch" {...props}>
      {/* Upload Area */}
      {showUploadArea && (
        <Box
          border="2px dashed"
          borderColor={isDragOver ? "blue.400" : "gray.300"}
          borderRadius="lg"
          p={6}
          textAlign="center"
          bg={isDragOver ? "blue.50" : "gray.50"}
          transition="all 0.2s"
          cursor={disabled ? "not-allowed" : "pointer"}
          opacity={disabled ? 0.6 : 1}
          _hover={!disabled ? {
            borderColor: "blue.400",
            bg: "blue.50"
          } : {}}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !disabled && document.getElementById('image-upload-input').click()}
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
              Hỗ trợ: JPG, PNG, GIF, WebP (tối đa {Math.round(maxSize / 1024 / 1024)}MB mỗi file)
            </Text>
          </VStack>
        </Box>
      )}

      {/* Hidden file input */}
      <input
        type="file"
        accept={acceptedTypes.join(',')}
        multiple
        onChange={handleFileInputChange}
        style={{ display: 'none' }}
        id="image-upload-input"
        disabled={disabled}
      />

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <Box>
          <HStack justify="space-between" mb={3}>
            <Text fontSize="sm" fontWeight="medium">
              Hình ảnh ({images.length}/{maxImages})
            </Text>
            {!disabled && (
              <Button
                size="xs"
                variant="outline"
                leftIcon={<Upload size={12} />}
                onClick={() => document.getElementById('image-upload-input').click()}
                aria-label="Thêm hình ảnh"
                isDisabled={images.length >= maxImages}
              >
                Thêm
              </Button>
            )}
          </HStack>
          
          {/* Horizontal scrollable container */}
          <Box
            overflowX="auto"
            overflowY="visible"
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
            <HStack spacing={3} align="flex-start" pb={2} px={2}>
              {images.map((image, index) => (
                <Box key={image.id || index} position="relative" flexShrink={0}>
                  <Box position="relative">
                    <Image
                      src={image.url || image.preview}
                      alt={image.name || `Image ${index + 1}`}
                      boxSize={previewSize}
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
                    
                    {/* Loading overlay */}
                    {image.isUploading && (
                      <Box
                        position="absolute"
                        top={0}
                        left={0}
                        right={0}
                        bottom={0}
                        bg="blackAlpha.600"
                        borderRadius="md"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <VStack spacing={2}>
                          <Spinner color="white" size="sm" />
                          <Text fontSize="xs" color="white">
                            Đang tải lên...
                          </Text>
                        </VStack>
                      </Box>
                    )}
                  </Box>
                  
                  {/* Remove button */}
                  {!disabled && !image.isUploading && (
                    <IconButton
                      icon={<X size={12} />}
                      size="xs"
                      colorScheme="red"
                      variant="solid"
                      position="absolute"
                      top="-6px"
                      right="-6px"
                      borderRadius="full"
                      onClick={() => handleRemove(index)}
                      aria-label="Xóa hình ảnh"
                      zIndex={10}
                      _hover={{
                        transform: "scale(1.1)"
                      }}
                    />
                  )}
                  
                  {/* Image name */}
                  <Text
                    fontSize="xs"
                    color="gray.500"
                    mt={1}
                    textAlign="center"
                    noOfLines={1}
                    maxW={previewSize}
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
  );
};

export default ImageUpload;
