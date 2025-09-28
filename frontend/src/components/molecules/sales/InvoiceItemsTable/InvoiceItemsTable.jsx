import React from "react";
import {
  Box,
  Card,
  CardBody,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from "@chakra-ui/react";
import { formatCurrency } from '@/utils/formatters';

const InvoiceItemsTable = ({ items = [] }) => {
  return (
    <Card>
      <CardBody>
        <Text fontSize="lg" fontWeight="bold" mb={4}>
          Danh sách sản phẩm
        </Text>
        <Box overflowX="auto">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Sản phẩm</Th>
                <Th>Phân loại</Th>
                <Th isNumeric>Số lượng</Th>
                <Th isNumeric>Đơn giá</Th>
                <Th isNumeric>Thành tiền</Th>
              </Tr>
            </Thead>
            <Tbody>
              {items && items.length > 0 ? (
                items.map((item) => (
                  <Tr key={item.id}>
                    <Td fontWeight="medium">{item.product_name}</Td>
                    <Td>{item.variant_name}</Td>
                    <Td isNumeric>{item.quantity}</Td>
                    <Td isNumeric>
                      {formatCurrency(item.unit_price)}
                    </Td>
                    <Td isNumeric fontWeight="bold">
                      {formatCurrency(item.total_price)}
                    </Td>
                  </Tr>
                ))
              ) : (
                <Tr>
                  <Td colSpan={5} textAlign="center" py={8}>
                    <Text color="gray.500">Không có sản phẩm nào</Text>
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </Box>
      </CardBody>
    </Card>
  );
};

export default InvoiceItemsTable;









