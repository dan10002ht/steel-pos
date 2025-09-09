import React from 'react';
import { Tr, Td, Badge, HStack, IconButton, Text } from '@chakra-ui/react';
import { Eye, Edit } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';
import {
  getInvoiceStatusColor,
  getInvoiceStatusText,
  getPaymentStatusColor,
  getPaymentStatusWithRemaining,
} from '@/utils/statusHelpers';

const SalesTableRow = ({ invoice, onViewDetail, onEdit }) => {
  return (
    <Tr>
      <Td fontWeight='medium'>{invoice.invoice_code}</Td>
      <Td>{invoice.customer_name}</Td>
      <Td>{invoice.customer_phone}</Td>
      <Td maxW='200px' isTruncated>
        {invoice.customer_address || 'Không có địa chỉ'}
      </Td>
      <Td>{new Date(invoice.created_at).toLocaleDateString('vi-VN')}</Td>
      <Td fontWeight='medium'>{formatCurrency(invoice.total_amount)}</Td>
      <Td>
        <Badge colorScheme={getInvoiceStatusColor(invoice.status)}>
          {getInvoiceStatusText(invoice.status)}
        </Badge>
      </Td>
      <Td>
        <Badge colorScheme={getPaymentStatusColor(invoice.payment_status)}>
          {getPaymentStatusWithRemaining(invoice)}
        </Badge>
      </Td>
      <Td>
        <HStack spacing={2}>
          <IconButton
            size='sm'
            icon={<Eye size={16} />}
            onClick={() => onViewDetail(invoice.id)}
            colorScheme='blue'
            variant='ghost'
            title='Xem chi tiết'
          />
          <IconButton
            size='sm'
            icon={<Edit size={16} />}
            onClick={() => onEdit(invoice.id)}
            colorScheme='orange'
            variant='ghost'
            title='Chỉnh sửa'
          />
        </HStack>
      </Td>
    </Tr>
  );
};

export default SalesTableRow;
