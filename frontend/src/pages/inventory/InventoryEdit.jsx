import React from 'react';
import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Text,
  Badge,
  Button,
  HStack,
  VStack,
  useToast,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { ArrowLeft, Save, X } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFetchApi } from '../../hooks/useFetchApi';
import { useEditApi } from '../../hooks/useEditApi';
import { importOrderService } from '../../services/importOrderService';
import Page from '../../components/organisms/Page';
import ImportOrderForm from '../../components/ImportOrderForm';
import { formatDate } from '../../utils/formatters';

const InventoryEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  // Fetch import order detail
  const { data: importOrderData, error } = useFetchApi(
    ['import-order', id],
    `/import-orders/${id}`
  );

  // Edit mutation
  const editMutation = useEditApi('/import-orders', {
    method: 'PUT',
    invalidateQueries: [['import-orders'], ['import-order', id]],
    onSuccess: () => {
      toast({
        title: 'Thành công',
        description: 'Đơn nhập hàng đã được cập nhật',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      navigate('/inventory');
    },
    onError: error => {
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể cập nhật đơn nhập hàng',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    },
  });

  const importOrder = importOrderData
    ? importOrderService.transformBackendToFrontend(importOrderData)
    : null;

  const handleSave = formData => {
    const orderData = {
      supplier_name: formData.supplier_name,
      import_date: new Date(formData.import_date),
      notes: formData.notes,
      import_images: formData.import_images,
      items: formData.items,
    };

    editMutation.mutate({
      id: id,
      data: orderData,
    });
  };

  const handleCancel = () => {
    navigate('/inventory');
  };

  const handleBack = () => {
    navigate('/inventory');
  };

  if (error) {
    return (
      <Page title='Chỉnh sửa đơn nhập hàng' onBack={handleBack}>
        <Alert status='error'>
          <AlertIcon />
          {error.message || 'Không thể tải thông tin đơn nhập hàng'}
        </Alert>
      </Page>
    );
  }

  if (!importOrder) {
    return (
      <Page title='Chỉnh sửa đơn nhập hàng' onBack={handleBack}>
        <Box>Đang tải...</Box>
      </Page>
    );
  }

  // Check if order can be edited (only pending orders)
  if (importOrder.status === 'approved') {
    return (
      <Page title='Chỉnh sửa đơn nhập hàng' onBack={handleBack}>
        <Alert status='warning'>
          <AlertIcon />
          Không thể chỉnh sửa đơn nhập hàng đã được phê duyệt
        </Alert>
        <Button
          leftIcon={<ArrowLeft size={16} />}
          variant='ghost'
          onClick={() => navigate('/inventory')}
          mt={4}
        >
          Quay lại
        </Button>
      </Page>
    );
  }

  return (
    <Page
      title='Chỉnh sửa đơn nhập hàng'
      subtitle={`Mã đơn: ${importOrder.importCode}`}
      onBack={handleBack}
      primaryActions={[
        {
          label: 'Lưu',
          onClick: () => handleSave(importOrder),
          colorScheme: 'blue',
          leftIcon: <Save size={16} />,
          isLoading: editMutation.isPending,
        },
      ]}
      secondaryActions={[
        {
          label: 'Hủy',
          onClick: handleCancel,
          variant: 'outline',
          leftIcon: <X size={16} />,
        },
      ]}
    >
      <Box w='100%' maxW='100%' mx='auto'>
        {/* Order Status Info */}
        <Card mb={6}>
          <CardBody>
            <HStack justify='space-between' align='center'>
              <VStack align='start' spacing={1}>
                <Text fontSize='sm' color='gray.600'>
                  Trạng thái
                </Text>
                <Badge
                  colorScheme={
                    importOrder.status === 'approved' ? 'green' : 'orange'
                  }
                  fontSize='md'
                  px={3}
                  py={1}
                >
                  {importOrder.status === 'approved'
                    ? 'Đã phê duyệt'
                    : 'Chờ phê duyệt'}
                </Badge>
              </VStack>
              <Text fontSize='sm' color='gray.600'>
                Ngày tạo: {formatDate(importOrder.importDate)}
              </Text>
            </HStack>
          </CardBody>
        </Card>

        {/* Edit Form */}
        <ImportOrderForm
          isEditing={true}
          initialData={importOrder}
          onSubmit={handleSave}
          onCancel={handleCancel}
          isLoading={editMutation.isPending}
        />
      </Box>
    </Page>
  );
};

export default InventoryEdit;
