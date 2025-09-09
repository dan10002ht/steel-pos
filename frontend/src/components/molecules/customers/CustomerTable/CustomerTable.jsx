import React from 'react';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  Box,
  VStack,
} from '@chakra-ui/react';
import CustomerTableRow from '@/components/atoms/customers/CustomerTableRow';
import Pagination from '@/components/atoms/Pagination';

const CustomerTable = ({
  customers,
  onViewDetail,
  onEdit,
  showPagination = true,
  size = 'md',
  // Pagination props
  currentPage = 1,
  totalPages = 0,
  totalItems = 0,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
}) => {
  return (
    <VStack spacing={4} align='stretch'>
      <Box overflowX='auto'>
        <Table variant='simple' size={size}>
          <Thead>
            <Tr>
              <Th fontWeight='bold'>Tên khách hàng</Th>
              <Th fontWeight='bold'>Số điện thoại</Th>
              <Th fontWeight='bold'>Địa chỉ</Th>
              <Th fontWeight='bold'>Trạng thái</Th>
              <Th fontWeight='bold'>Ngày tạo</Th>
              <Th fontWeight='bold'>Thao tác</Th>
            </Tr>
          </Thead>
          <Tbody>
            {customers.length === 0 ? (
              <Tr>
                <Td colSpan={6} textAlign='center' py={8}>
                  <Text color='gray.500'>Không có khách hàng nào</Text>
                </Td>
              </Tr>
            ) : (
              customers.map(customer => (
                <CustomerTableRow
                  key={customer.id}
                  customer={customer}
                  onViewDetail={onViewDetail}
                  onEdit={onEdit}
                />
              ))
            )}
          </Tbody>
        </Table>
      </Box>

      {showPagination && totalPages > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      )}
    </VStack>
  );
};

export default CustomerTable;
