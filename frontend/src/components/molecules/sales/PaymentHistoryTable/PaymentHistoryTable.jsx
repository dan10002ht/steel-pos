import React from 'react';
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
  Badge,
  Button,
  Link,
} from '@chakra-ui/react';
import { Plus, Image as ImageIcon } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';

const PaymentHistoryTable = ({
  payments = [],
  isLoading = false,
  error = null,
  onUploadImage = null,
  onPreviewImages = null,
}) => {
  const getPaymentMethodText = method => {
    switch (method) {
      case 'cash':
        return 'Tiền mặt';
      case 'card':
        return 'Thẻ';
      case 'bank_transfer':
        return 'Chuyển khoản';
      case 'credit':
        return 'Ghi nợ';
      default:
        return method;
    }
  };

  const getPaymentImages = payment => {
    if (!payment.payment_images) return [];

    try {
      const images = JSON.parse(payment.payment_images);
      return Array.isArray(images) ? images.map(img => img.url || img) : [];
    } catch (e) {
      console.error('Error parsing payment images:', e);
      return [];
    }
  };

  const handlePreviewImages = payment => {
    const images = getPaymentImages(payment);
    if (images.length > 0 && onPreviewImages) {
      onPreviewImages(images, 0);
    }
  };

  return (
    <Card>
      <CardBody>
        <Text fontSize='lg' fontWeight='bold' mb={4}>
          Lịch sử thanh toán
        </Text>
        {isLoading ? (
          <Text color='gray.500'>Đang tải lịch sử thanh toán...</Text>
        ) : error ? (
          <Text color='red.500'>
            Lỗi tải lịch sử thanh toán: {error.message}
          </Text>
        ) : payments && payments.length > 0 ? (
          <Box overflowX='auto'>
            <Table variant='simple' size='sm'>
              <Thead>
                <Tr>
                  <Th>Ngày thanh toán</Th>
                  <Th>Phương thức</Th>
                  <Th isNumeric>Số tiền</Th>
                  <Th>Ghi chú / Minh chứng</Th>
                </Tr>
              </Thead>
              <Tbody>
                {payments.map(payment => {
                  const images = getPaymentImages(payment);
                  const hasImages = images.length > 0;

                  return (
                    <Tr key={payment.id}>
                      <Td>
                        {new Date(payment.payment_date).toLocaleString('vi-VN')}
                      </Td>
                      <Td>
                        <Badge colorScheme='blue'>
                          {getPaymentMethodText(payment.payment_method)}
                        </Badge>
                      </Td>
                      <Td isNumeric fontWeight='bold' color='green.500'>
                        {formatCurrency(payment.amount)}
                      </Td>
                      <Td>
                        <Box>
                          {payment.notes && (
                            <Text
                              fontSize='sm'
                              mb={hasImages || onUploadImage ? 2 : 0}
                            >
                              {payment.notes}
                            </Text>
                          )}
                          {hasImages ? (
                            <Link
                              color='blue.500'
                              fontSize='sm'
                              fontWeight='medium'
                              onClick={() => handlePreviewImages(payment)}
                              cursor='pointer'
                              display='inline-flex'
                              alignItems='center'
                              gap={1}
                              _hover={{ textDecoration: 'underline' }}
                            >
                              <ImageIcon size={14} />
                              Xem hóa đơn ({images.length})
                            </Link>
                          ) : (
                            onUploadImage && (
                              <Button
                                size='xs'
                                leftIcon={<Plus size={14} />}
                                variant='outline'
                                colorScheme='blue'
                                onClick={() => onUploadImage(payment)}
                              >
                                Bổ sung hóa đơn...
                              </Button>
                            )
                          )}
                        </Box>
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          </Box>
        ) : (
          <Text color='gray.500'>Chưa có lịch sử thanh toán</Text>
        )}
      </CardBody>
    </Card>
  );
};

export default PaymentHistoryTable;
