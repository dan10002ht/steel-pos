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
  HStack,
  Icon,
} from '@chakra-ui/react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import CustomerTableRow from '@/components/atoms/customers/CustomerTableRow';
import Pagination from '@/components/atoms/Pagination';

const SortableHeader = ({ label, field, sortBy, sortOrder, onSort, ...props }) => {
  const isActive = sortBy === field;
  return (
    <Th
      cursor='pointer'
      userSelect='none'
      onClick={() => onSort(field)}
      _hover={{ bg: 'gray.50' }}
      {...props}
    >
      <HStack spacing={1} justify={props.isNumeric ? 'flex-end' : 'flex-start'}>
        <Text fontWeight='bold'>{label}</Text>
        {isActive ? (
          sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
        ) : (
          <ChevronsUpDown size={14} color='gray' />
        )}
      </HStack>
    </Th>
  );
};

const CustomerTable = ({
  customers,
  onViewDetail,
  showPagination = true,
  size = 'md',
  sortBy = 'created_at',
  sortOrder = 'desc',
  onSort,
  // Pagination props
  currentPage = 1,
  totalPages = 0,
  totalItems = 0,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
}) => {
  const handleSort = field => {
    if (!onSort) return;
    if (sortBy === field) {
      onSort(field, sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      onSort(field, field === 'name' ? 'asc' : 'desc');
    }
  };

  return (
    <VStack spacing={4} align='stretch'>
      <Box overflowX='auto'>
        <Table variant='simple' size={size}>
          <Thead>
            <Tr>
              <SortableHeader label='Tên khách hàng' field='name' sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} minW='200px' />
              <Th minW='160px' fontWeight='bold'>
                Số điện thoại
              </Th>
              <Th fontWeight='bold' minW='200px'>
                Địa chỉ
              </Th>
              <SortableHeader label='Tồn nợ' field='unpaid_debt' sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} isNumeric />
              <Th fontWeight='bold'>Trạng thái</Th>
              <SortableHeader label='Ngày tạo' field='created_at' sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
              <Th fontWeight='bold'>Thao tác</Th>
            </Tr>
          </Thead>
          <Tbody>
            {customers.length === 0 ? (
              <Tr>
                <Td colSpan={7} textAlign='center' py={8}>
                  <Text color='gray.500'>Không có khách hàng nào</Text>
                </Td>
              </Tr>
            ) : (
              customers.map(customer => (
                <CustomerTableRow
                  key={customer.id}
                  customer={customer}
                  onViewDetail={onViewDetail}
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
