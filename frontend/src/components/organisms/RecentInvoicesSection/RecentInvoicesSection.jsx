import React from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  HStack,
  Text,
  Button,
  VStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Skeleton,
  SkeletonText,
} from '@chakra-ui/react';
import SalesTable from '@/components/molecules/sales/SalesTable';
import { useFetchApi } from '@/hooks/useFetchApi';

const RecentInvoicesSection = ({
  customerId,
  onViewAll,
  onCreateInvoice,
  onInvoiceClick,
}) => {
  // Fetch customer invoices
  const {
    data: invoicesResult,
    isLoading,
    error,
  } = useFetchApi(
    ['customer', customerId, 'invoices'],
    `/customers/${customerId}/invoices`,
    {
      enabled: !!customerId,
    }
  );

  const invoices = invoicesResult?.invoices || [];

  const totalInvoices = invoicesResult?.total || 0;

  return (
    <Card>
      <CardHeader>
        <HStack justify='space-between'>
          <Text fontSize='lg' fontWeight='bold'>
            Hóa đơn gần đây
          </Text>
          <Button size='sm' variant='outline' onClick={onViewAll}>
            Xem tất cả
          </Button>
        </HStack>
      </CardHeader>
      <CardBody>
        {isLoading ? (
          <Table size='sm'>
            <Thead>
              <Tr>
                <Th>Mã HĐ</Th>
                <Th>Khách hàng</Th>
                <Th>Tổng tiền</Th>
                <Th>Trạng thái</Th>
                <Th>Thao tác</Th>
              </Tr>
            </Thead>
            <Tbody>
              {[...Array(3)].map((_, index) => (
                <Tr key={index}>
                  <Td>
                    <Skeleton height='20px' width='80px' />
                  </Td>
                  <Td>
                    <Skeleton height='20px' width='120px' />
                  </Td>
                  <Td>
                    <Skeleton height='20px' width='100px' />
                  </Td>
                  <Td>
                    <Skeleton height='20px' width='80px' />
                  </Td>
                  <Td>
                    <Skeleton height='20px' width='60px' />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        ) : error ? (
          <VStack spacing={4} align='center' justify='center' minH='100px'>
            <Text color='red.500' textAlign='center'>
              Không thể tải danh sách hóa đơn
            </Text>
          </VStack>
        ) : totalInvoices === 0 ? (
          <VStack spacing={4} align='center' justify='center' minH='100px'>
            <Text color='gray.500' textAlign='center'>
              Khách hàng chưa có hóa đơn nào
            </Text>
            <Button size='sm' colorScheme='blue' onClick={onCreateInvoice}>
              Tạo hóa đơn mới
            </Button>
          </VStack>
        ) : (
          <SalesTable
            invoices={invoices.slice(0, 5)}
            onViewDetail={onInvoiceClick}
            onEdit={onInvoiceClick}
            showPagination={false}
            size='sm'
          />
        )}
      </CardBody>
    </Card>
  );
};

export default RecentInvoicesSection;
