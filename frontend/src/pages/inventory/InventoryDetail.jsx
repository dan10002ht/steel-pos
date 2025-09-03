import React from 'react';
import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Text,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  HStack,
  VStack,
  Button,
  Divider,
  Grid,
  GridItem,
  IconButton,
  useToast,
} from '@chakra-ui/react';
import { ArrowLeft, Edit, Download, Printer } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFetchApi } from '../../hooks/useFetchApi';

import Page from '../../components/organisms/Page';
import { formatCurrency, formatDate } from '../../utils/formatters';

const InventoryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  // Fetch import order detail
  const { data: importOrderData, error } = useFetchApi(
    ['import-order', id],
    `/import-orders/${id}`
  );

  const importOrder = importOrderData || null;

  const handleEdit = () => {
    navigate(`/inventory/${id}/edit`);
  };

  const handleBack = () => {
    navigate('/inventory');
  };

  const handleExportExcel = () => {
    toast({
      title: 'Thông báo',
      description: 'Chức năng xuất Excel sẽ được implement sau',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  const handlePrint = () => {
    toast({
      title: 'Thông báo',
      description: 'Chức năng in phiếu sẽ được implement sau',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  if (error) {
    toast({
      title: 'Lỗi',
      description: error.message || 'Không thể tải thông tin đơn nhập hàng',
      status: 'error',
      duration: 3000,
      isClosable: true,
    });
  }

  if (!importOrder) {
    return (
      <Page title='Chi tiết đơn nhập hàng' onBack={handleBack}>
        <Box>Đang tải...</Box>
      </Page>
    );
  }

  return (
    <Page
      title='Chi tiết đơn nhập hàng'
      subtitle={`Mã đơn: ${importOrder.import_code}`}
      onBack={handleBack}
      primaryActions={[
        {
          label: 'Sửa',
          onClick: handleEdit,
          colorScheme: 'blue',
          leftIcon: <Edit size={16} />,
        },
      ]}
      secondaryActions={[
        {
          label: 'Xuất Excel',
          onClick: handleExportExcel,
          variant: 'outline',
          leftIcon: <Download size={16} />,
        },
        {
          label: 'In phiếu',
          onClick: handlePrint,
          variant: 'outline',
          leftIcon: <Printer size={16} />,
        },
      ]}
    >
      <Box w='100%' maxW='100%' mx='auto'>
        {/* Order Information */}
        <Card mb={6}>
          <CardHeader>
            <Heading size={{base: 'sm', md: 'md'}}>Thông tin đơn nhập hàng</Heading>
          </CardHeader>
          <CardBody>
            <Grid
              templateColumns='repeat(auto-fit, minmax(300px, 1fr))'
              gap={6}
            >
              <GridItem>
                <VStack align='start' spacing={3}>
                  <Box>
                    <Text fontWeight='bold' color='gray.600' fontSize='sm'>
                      Mã đơn nhập hàng
                    </Text>
                    <Text fontSize='lg'>{importOrder.import_code}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight='bold' color='gray.600' fontSize='sm'>
                      Nhà cung cấp
                    </Text>
                    <Text fontSize='lg'>{importOrder.supplier_name}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight='bold' color='gray.600' fontSize='sm'>
                      Ngày nhập kho
                    </Text>
                    <Text fontSize='lg'>
                      {formatDate(importOrder.import_date)}
                    </Text>
                  </Box>
                </VStack>
              </GridItem>
              <GridItem>
                <VStack align='start' spacing={3}>
                  <Box>
                    <Text fontWeight='bold' color='gray.600' fontSize='sm'>
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
                  </Box>
                  <Box>
                    <Text fontWeight='bold' color='gray.600' fontSize='sm'>
                      Tổng giá trị
                    </Text>
                    <Text fontSize='lg' fontWeight='bold' color='blue.600'>
                      {formatCurrency(importOrder.total_amount)}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontWeight='bold' color='gray.600' fontSize='sm'>
                      Số lượng sản phẩm
                    </Text>
                    <Text fontSize='lg'>{importOrder.items?.length || 0}</Text>
                  </Box>
                </VStack>
              </GridItem>
            </Grid>
            {importOrder.notes && (
              <>
                <Divider my={4} />
                <Box>
                  <Text fontWeight='bold' color='gray.600' fontSize='sm' mb={2}>
                    Ghi chú
                  </Text>
                  <Text>{importOrder.notes}</Text>
                </Box>
              </>
            )}
          </CardBody>
        </Card>

        {/* Items Table */}
        <Card>
          <CardHeader>
            <Heading size={{base: 'sm', md: 'md'}}>Danh sách sản phẩm</Heading>
          </CardHeader>
          <CardBody>
            <Box overflowX='auto'>
              <Table variant='simple' size='sm'>
                <Thead>
                  <Tr>
                    <Th>STT</Th>
                    <Th>Sản phẩm</Th>
                    <Th>Phân loại</Th>
                    <Th isNumeric>Số lượng</Th>
                    <Th>Đơn vị</Th>
                    <Th isNumeric>Đơn giá</Th>
                    <Th isNumeric>Thành tiền</Th>
                    <Th>Ghi chú</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {importOrder.items?.map((item, index) => (
                    <Tr key={index}>
                      <Td>{index + 1}</Td>
                          <Td>{item.product_name}</Td>
                        <Td>{item.variant_name}</Td>
                      <Td isNumeric>{item.quantity}</Td>
                      <Td>{item.unit}</Td>
                          <Td isNumeric>{formatCurrency(item.unit_price)}</Td>
                        <Td isNumeric>{formatCurrency(item.total_price)}</Td>
                      <Td>{item.notes || '-'}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          </CardBody>
        </Card>
      </Box>
    </Page>
  );
};

export default InventoryDetail;
