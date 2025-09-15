import React from 'react';
import { Tr, Td, Badge, HStack, IconButton, Text, Tooltip } from '@chakra-ui/react';
import { Eye, Edit, X, CreditCard } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';
import {
  getInvoiceStatusColor,
  getInvoiceStatusText,
  getPaymentStatusColor,
  getPaymentStatusWithRemaining,
} from '@/utils/statusHelpers';

const SalesTableRow = ({ invoice, onViewDetail, onEdit, onCancel, onPayment, isAdmin = false }) => {
  return (
    <Tr>
      <Td fontWeight='medium'>{invoice.invoice_code}</Td>
      <Td>{invoice.customer_name}</Td>
      <Td>{invoice.customer_phone}</Td>
      <Td maxW='200px'>
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
        <HStack spacing={2} justify='flex-end'>
        {invoice.payment_status !== 'paid' && invoice.status !== 'cancelled' && (
            <Tooltip label="Thanh toán" placement="top" hasArrow>
              <IconButton
                size='sm'
                icon={<CreditCard size={16} />}
                onClick={() => onPayment(invoice)}
                colorScheme='green'
                variant='ghost'
              />
            </Tooltip>
          )}
          <Tooltip label="Xem chi tiết hóa đơn" placement="top" hasArrow>
            <IconButton
              size='sm'
              icon={<Eye size={16} />}
              onClick={() => onViewDetail(invoice.id)}
              colorScheme='blue'
              variant='ghost'
            />
          </Tooltip>
   
          
      
        </HStack>
      </Td>
    </Tr>
  );
};

export default SalesTableRow;