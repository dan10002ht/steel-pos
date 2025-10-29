import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Select,
  Textarea,
  Divider,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Button,
} from '@chakra-ui/react';
import { Save, Printer } from 'lucide-react';
import { PAYMENT_METHODS } from '@/constants/options';
import { formatCurrency } from '@/utils';

const InvoiceSummary = ({
  invoice,
  onUpdateInvoice,
  onCreateInvoice,
  onCreateInvoiceAndPrint,
  isDisabled = false,
  isLoading = false,
}) => {
  const calculateSubtotal = () => {
    return invoice.items.reduce((sum, item) => sum + item.totalPrice, 0);
  };

  const calculateFinalAmount = () => {
    const subtotal = calculateSubtotal();
    const discount = invoice.discount || 0;
    return subtotal - discount;
  };

  const calculateRemainingAmount = () => {
    const totalAmount = calculateFinalAmount();
    const paidAmount = invoice.paidAmount || 0;
    return totalAmount - paidAmount;
  };

  return (
    <VStack spacing={4} align='stretch'>
      <Text fontSize='lg' fontWeight='bold'>
        Thông tin hoá đơn
      </Text>

      <HStack justify='space-between'>
        <Text>Hình thức thanh toán:</Text>
        <Select
          value={invoice.paymentMethod || ''}
          onChange={e => onUpdateInvoice('paymentMethod', e.target.value)}
          maxW='200px'
        >
          <option value=''>Chọn hình thức</option>
          {PAYMENT_METHODS.map(method => (
            <option key={method.value} value={method.value}>
              {method.label}
            </option>
          ))}
        </Select>
      </HStack>

      <Box>
        <Text fontSize='sm' color='gray.600' mb={1}>
          Ghi chú (nội bộ)
        </Text>
        <Textarea
          value={invoice.notes || ''}
          onChange={e => onUpdateInvoice('notes', e.target.value)}
          placeholder='Nhập ghi chú nếu cần...'
          rows={3}
        />
      </Box>

      <Divider />

      {/* Payment Summary */}
      <VStack spacing={2} align='stretch'>
        <HStack justify='space-between'>
          <Text>Thành tiền:</Text>
          <Text>{formatCurrency(calculateSubtotal())}</Text>
        </HStack>

        <HStack justify='space-between'>
          <Text>Giảm giá:</Text>
          <NumberInput
            value={invoice.discount || 0}
            min={0}
            max={calculateSubtotal()}
            onChange={value => onUpdateInvoice('discount', parseInt(value))}
            maxW='150px'
          >
            <NumberInputField />
          </NumberInput>
        </HStack>

        <Divider />

        <HStack justify='space-between'>
          <Text fontWeight='bold' fontSize='lg'>
            Tổng cộng:
          </Text>
          <Text fontWeight='bold' fontSize='lg' color='blue.500'>
            {formatCurrency(calculateFinalAmount())}
          </Text>
        </HStack>

        <Divider />

        {/* Payment Amount Fields */}
        <HStack justify='space-between'>
          <Text>Đã thanh toán:</Text>
          <NumberInput
            value={invoice.paidAmount || 0}
            min={0}
            max={calculateFinalAmount()}
            onChange={value => onUpdateInvoice('paidAmount', parseInt(value))}
            maxW='150px'
          >
            <NumberInputField />
          </NumberInput>
        </HStack>

        <HStack justify='space-between'>
          <Text
            fontWeight='bold'
            color={calculateRemainingAmount() > 0 ? 'red.500' : 'green.500'}
          >
            Còn lại:
          </Text>
          <Text
            fontWeight='bold'
            color={calculateRemainingAmount() > 0 ? 'red.500' : 'green.500'}
          >
            {formatCurrency(calculateRemainingAmount())}
          </Text>
        </HStack>
      </VStack>

      <HStack spacing={3}>
        <Button
          leftIcon={<Save size={16} />}
          colorScheme='blue'
          size='lg'
          onClick={onCreateInvoice}
          isDisabled={isDisabled}
          isLoading={isLoading}
          loadingText='Đang tạo...'
          flex={1}
        >
          Tạo hoá đơn
        </Button>

        <Button
          leftIcon={<Printer size={16} />}
          colorScheme='green'
          size='lg'
          onClick={onCreateInvoiceAndPrint}
          isDisabled={isDisabled}
          isLoading={isLoading}
          loadingText='Đang tạo...'
          flex={1}
        >
          Tạo hoá đơn và in
        </Button>
      </HStack>
    </VStack>
  );
};

export default InvoiceSummary;
