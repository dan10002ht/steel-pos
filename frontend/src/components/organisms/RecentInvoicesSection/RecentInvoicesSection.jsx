import React, { useState } from 'react';
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
} from '@chakra-ui/react';
import SalesTable from '@/components/molecules/sales/SalesTable';
import { useFetchApi } from '@/hooks/useFetchApi';

const RecentInvoicesSection = ({
  customerId,
  onViewAll,
  onCreateInvoice,
  onInvoiceClick,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Fetch customer invoices with pagination
  const {
    data: invoicesResult,
    isLoading,
    error,
  } = useFetchApi(
    ['customer', customerId, 'invoices', currentPage, pageSize],
    `/customers/${customerId}/invoices?page=${currentPage}&limit=${pageSize}`,
    {
      enabled: !!customerId,
    }
  );

  const invoices = invoicesResult?.invoices || [];
  const totalInvoices = invoicesResult?.total || 0;
  const totalPages = Math.ceil(totalInvoices / pageSize);

  const handlePageChange = page => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = event => {
    const newPageSize = parseInt(event.target.value);
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  return (
    <Card>
      <CardHeader>
        <Text fontSize='lg' fontWeight='bold'>
          Hóa đơn gần đây
        </Text>
        Chi tiết khách hàng
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
            invoices={invoices}
            onViewDetail={onInvoiceClick}
            onEdit={onInvoiceClick}
            showPagination={true}
            size='sm'
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalInvoices}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            isCustomerPage={true}
          />
        )}
      </CardBody>
    </Card>
  );
};

export default RecentInvoicesSection;
