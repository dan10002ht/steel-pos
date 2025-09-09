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
import Pagination from '@/components/atoms/Pagination';
import SalesTableRow from '@/components/atoms/sales/SalesTableRow';

const SalesTable = ({
  invoices,
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
              <Th>Mã hoá đơn</Th>
              <Th>Tên khách hàng</Th>
              <Th>Số điện thoại</Th>
              <Th>Địa chỉ</Th>
              <Th>Ngày tạo</Th>
              <Th>Tổng tiền</Th>
              <Th>Trạng thái</Th>
              <Th>Thanh toán</Th>
              <Th>Hành động</Th>
            </Tr>
          </Thead>
          <Tbody>
            {invoices.length === 0 ? (
              <Tr>
                <Td colSpan={9} textAlign='center' py={8}>
                  <Text color='gray.500'>Không có hoá đơn nào</Text>
                </Td>
              </Tr>
            ) : (
              invoices.map(invoice => (
                <SalesTableRow
                  key={invoice.id}
                  invoice={invoice}
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

export default SalesTable;
