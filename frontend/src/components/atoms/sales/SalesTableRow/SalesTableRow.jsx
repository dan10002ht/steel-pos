import React from 'react';
import {
  Tr,
  Td,
  Badge,
  HStack,
  IconButton,
  Text,
  Tooltip,
} from '@chakra-ui/react';
import { Eye, Edit, X, CreditCard } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';
import {
  getPaymentStatusColor,
  getPaymentStatusWithRemaining,
} from '@/utils/statusHelpers';

const SalesTableRow = ({
  invoice,
  onViewDetail,
  onPayment,
  isCustomerPage,
}) => {
  const remainingAmount = invoice.total_amount - invoice.paid_amount;
  return (
    <Tr
      height={'60px'}
      _hover={{ bg: 'gray.50' }}
      cursor='pointer'
      onClick={() => onViewDetail(invoice.id)}
    >
      <Td>
        <Text fontWeight='bold' fontSize='md'>
          {invoice.invoice_code}
        </Text>
      </Td>
      {!isCustomerPage && <Td>{invoice.customer_name}</Td>}
      {!isCustomerPage && <Td>{invoice.customer_phone}</Td>}
      {!isCustomerPage && (
        <Td>{new Date(invoice.created_at).toLocaleDateString('vi-VN')}</Td>
      )}
      <Td fontWeight='medium'>{formatCurrency(invoice.total_amount)}</Td>
      <Td fontWeight='medium'>{formatCurrency(remainingAmount)}</Td>
      <Td>
        <Badge
          colorScheme={getPaymentStatusColor(
            invoice.payment_status,
            invoice.status
          )}
        >
          {getPaymentStatusWithRemaining(invoice)}
        </Badge>
      </Td>
      <Td>
        <HStack spacing={2} justify='flex-end'>
          {invoice.payment_status !== 'paid' &&
            invoice.status !== 'cancelled' && (
              <Tooltip label='Thanh toán' placement='top' hasArrow>
                <IconButton
                  size='sm'
                  icon={<CreditCard size={16} />}
                  onClick={e => {
                    e.stopPropagation();
                    onPayment(invoice);
                  }}
                  colorScheme='green'
                  variant='ghost'
                />
              </Tooltip>
            )}
        </HStack>
      </Td>
    </Tr>
  );
};

export default SalesTableRow;
