import React from 'react';
import {
  Box,
  VStack,
  Heading,
  Button,
  Card,
  CardBody,
  Divider,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  HStack,
  Text,
  Flex,
} from '@chakra-ui/react';
import { Plus } from 'lucide-react';
import { useImportOrderForm } from '../../hooks/useImportOrderForm';
import { useImportOrderItems } from '../../hooks/useImportOrderItems';
import { formatCurrency } from '@/utils/formatters';
import { fetchApi } from '@/shared/services/api';
import FormInput from '../../../../components/atoms/FormInput/FormInput';
import FormDateInput from '../../../../components/atoms/FormDateInput';
import FormSection from '../../../../components/molecules/FormSection/FormSection';
import FormRow from '../../../../components/molecules/FormRow/FormRow';
import ImageUpload from '../../../../components/atoms/ImageUpload/ImageUpload';
import ProductRow from '../../../../components/molecules/ProductRow/ProductRow';
import FormActions from '../../../../components/molecules/FormActions/FormActions';

const ImportOrderForm = ({
  onNavigateToList,
  isEditing = false,
  initialData = null,
  onSubmit = null,
  onCancel = null,
}) => {
  const {
    formData,
    errors,
    handleInputChange,
    handleSubmit,
    isLoading,
    setFormData,
  } = useImportOrderForm({
    isEditing,
    initialData,
    onNavigateToList,
  });

  const {
    products,
    calculateTotal,
    handleProductChange,
    handleProductSelect,
    handleVariantSelect,
    addProduct,
    removeProduct,
  } = useImportOrderItems({
    isEditing,
    initialData,
  });

  const handleFileUpload = async (file, tempImage) => {
    // Clear error when user uploads an image
    if (errors.documents) {
      handleInputChange('documents', [...formData.documents, tempImage]);
    }

    // If no file provided, just add temp image to state (for preview)
    if (!file) {
      const normalizedTempImage = {
        id: tempImage.id,
        name: tempImage.name,
        url: tempImage.preview, // Use preview URL for display
        isUploading: true, // Mark as uploading
      };
      setFormData(prev => ({
        ...prev,
        documents: [...prev.documents, normalizedTempImage],
      }));
      return normalizedTempImage;
    }

    // Create FormData for upload
    const uploadFormData = new FormData();
    uploadFormData.append('images', file);

    try {
      // Upload images using fetchApi
      const response = await fetchApi({
        method: 'POST',
        url: '/images/upload',
        data: uploadFormData,
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
        url: uploadedImage.secure_url,
        name: uploadedImage.public_id.split('/').pop(),
        isUploading: false,
      };

      // Replace temp image with uploaded image
      setFormData(prev => ({
        ...prev,
        documents: prev.documents.map(doc =>
          doc.id === tempImage.id ? uploadedImageData : doc
        ),
      }));

      return uploadedImageData;
    } catch (error) {
      console.error('Error uploading images:', error);

      // Remove failed image from state
      setFormData(prev => ({
        ...prev,
        documents: prev.documents.filter(doc => doc.id !== tempImage.id),
      }));

      throw error;
    }
  };

  const handleFileRemove = index => {
    const newDocuments = formData.documents.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      documents: newDocuments,
    }));
  };

  const onSubmitForm = () => {
    handleSubmit(products, onSubmit);
  };

  return (
    <Box>
      <Card>
        <CardBody>
          <VStack spacing={6} align='stretch'>
            {/* Form Header */}
            <FormSection title='Thông tin đơn nhập hàng'>
              <FormRow>
                <FormInput
                  label='Mã đơn nhập hàng'
                  name='importCode'
                  value={formData.importCode}
                  onChange={e =>
                    handleInputChange('importCode', e.target.value)
                  }
                  isReadOnly
                  flex={1}
                />
                <FormInput
                  label='Nhà cung cấp'
                  name='supplier'
                  value={formData.supplier}
                  onChange={e => handleInputChange('supplier', e.target.value)}
                  placeholder='Nhập tên nhà cung cấp'
                  isRequired
                  error={errors.supplier}
                  flex={1}
                />
              </FormRow>

              <FormRow>
                <FormDateInput
                  label='Ngày nhập kho'
                  name='importDate'
                  value={formData.importDate}
                  onChange={e =>
                    handleInputChange('importDate', e.target.value)
                  }
                  isRequired
                  error={errors.importDate}
                  flex={1}
                />
                <FormInput
                  label='Ghi chú'
                  name='notes'
                  value={formData.notes}
                  onChange={e => handleInputChange('notes', e.target.value)}
                  placeholder='Ghi chú (không bắt buộc)'
                  flex={1}
                />
              </FormRow>

              <Box>
                <Text fontSize='sm' fontWeight='medium' mb={3}>
                  Chứng từ{' '}
                  <Text as='span' color='red.500'>
                    *
                  </Text>
                </Text>
                <ImageUpload
                  images={formData.documents}
                  onUpload={handleFileUpload}
                  onRemove={handleFileRemove}
                  maxImages={10}
                  maxSize={10 * 1024 * 1024} // 10MB
                  acceptedTypes={[
                    'image/jpeg',
                    'image/png',
                    'image/gif',
                    'image/webp',
                    'application/pdf',
                  ]}
                  previewSize='100px'
                  showUploadArea={true}
                  disabled={isLoading}
                />
                {errors.documents && (
                  <Text color='red.500' fontSize='sm' mt={2}>
                    {errors.documents}
                  </Text>
                )}
              </Box>
            </FormSection>

            <Divider />

            {/* Products Section */}
            <FormSection
              title='Danh sách sản phẩm'
              divider={false}
              primaryActions={[
                {
                  label: 'Thêm sản phẩm',
                  onClick: addProduct,
                  size: { base: 'sm', md: 'md' },
                },
              ]}
            >
              <Box overflowX='auto'>
                <Table variant='simple' size='sm'>
                  <Thead>
                    <Tr>
                      <Th minW='200px'>Sản phẩm</Th>
                      <Th minW='200px'>Phân loại</Th>
                      <Th minW='100px'>Số lượng</Th>
                      <Th minW='150px'>Đơn giá</Th>
                      <Th minW='150px'>Thành tiền</Th>
                      <Th>Thao tác</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {products
                      .filter(product => !product.is_deleted)
                      .map((product, index) => (
                        <ProductRow
                          key={product.id}
                          product={product}
                          index={index}
                          onProductSelect={handleProductSelect}
                          onVariantSelect={handleVariantSelect}
                          onProductChange={handleProductChange}
                          onRemove={removeProduct}
                          isEditing={isEditing}
                          isDisabled={products.length === 1}
                        />
                      ))}
                  </Tbody>
                </Table>
              </Box>

              {errors.products && (
                <Text color='red.500' fontSize='sm'>
                  {errors.products}
                </Text>
              )}

              <Divider />

              <Flex justify='space-between' align='center'>
                <Text fontSize={{ base: 'sm', md: 'md' }} fontWeight='bold'>
                  Tổng cộng: {formatCurrency(calculateTotal())}
                </Text>
                <FormActions>
                  {onCancel && (
                    <Button
                      size={{ base: 'sm', md: 'md' }}
                      variant='outline'
                      onClick={onCancel}
                      isDisabled={isLoading}
                    >
                      Hủy
                    </Button>
                  )}
                  <Button
                    size={{ base: 'sm', md: 'md' }}
                    colorScheme='blue'
                    onClick={onSubmitForm}
                    isLoading={isLoading}
                    loadingText={isEditing ? 'Đang cập nhật...' : 'Đang tạo...'}
                  >
                    {isEditing ? 'Cập nhật đơn nhập hàng' : 'Tạo đơn nhập hàng'}
                  </Button>
                </FormActions>
              </Flex>
            </FormSection>
          </VStack>
        </CardBody>
      </Card>
    </Box>
  );
};

export default ImportOrderForm;
