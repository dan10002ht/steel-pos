import React from 'react';
import {
  Box,
  Card,
  CardBody,
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
import Page from '../../components/organisms/Page';
import ImportOrderForm from '../../features/import-orders/components/ImportOrderForm/ImportOrderForm';
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

  const importOrder = importOrderData || null;
  console.log({importOrder})

  const handleSave = (formDataFromComponent) => {
    // formDataFromComponent đã có items rồi, không cần transform nữa
    const orderData = {
      supplier_name: formDataFromComponent.supplier_name,
      import_date: new Date(formDataFromComponent.import_date),
      notes: formDataFromComponent.notes,
      import_images: formDataFromComponent.import_images,
      items: formDataFromComponent.items,
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
      title={<HStack align='center'>
        <Text>Chỉnh sửa đơn nhập hàng</Text>
        <Badge
                  colorScheme={
                    importOrder.status === 'approved' ? 'green' : 'orange'
                  }
                  fontSize="sm"
                  px={3}
                  py={1}
                >
                  {importOrder.status === 'approved'
                    ? 'Đã phê duyệt'
                    : 'Chờ phê duyệt'}
                </Badge>
      </HStack>}
      subtitle={`Ngày tạo: ${formatDate(importOrder.import_date)}`}
      onBack={handleBack}
    >
      <Box w='100%' maxW='100%' mx='auto'>
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
