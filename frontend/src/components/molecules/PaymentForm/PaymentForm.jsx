import React from 'react';
import {
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  VStack,
  HStack,
  Text,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Button,
} from '@chakra-ui/react';
import ImageUpload from '@/components/atoms/ImageUpload';
import { PAYMENT_METHODS } from '@/constants/options';

const PaymentForm = ({
  formData,
  errors,
  remainingAmount,
  onInputChange,
  onImageUpload,
  onImageRemove,
  disabled = false,
}) => {
  return (
    <VStack spacing={4} align='stretch'>
      {/* Amount Input */}
      <FormControl isRequired isInvalid={!!errors.amount}>
        <FormLabel>Số tiền thanh toán</FormLabel>
        <HStack>
          <NumberInput
            value={formData.amount}
            onChange={value => onInputChange('amount', value)}
            min={0}
            precision={2}
            flex={1}
            isDisabled={disabled}
          >
            <NumberInputField placeholder='Nhập số tiền' />
          </NumberInput>
        </HStack>
        {errors.amount && (
          <Text fontSize='sm' color='red.500' mt={1}>
            {errors.amount}
          </Text>
        )}
      </FormControl>

      {/* Payment Method */}
      <FormControl isRequired isInvalid={!!errors.payment_method}>
        <FormLabel>Phương thức thanh toán</FormLabel>
        <Select
          value={formData.payment_method}
          onChange={e => onInputChange('payment_method', e.target.value)}
          isDisabled={disabled}
        >
          {PAYMENT_METHODS.map(method => (
            <option key={method.value} value={method.value}>
              {method.label}
            </option>
          ))}
        </Select>
        {errors.payment_method && (
          <Text fontSize='sm' color='red.500' mt={1}>
            {errors.payment_method}
          </Text>
        )}
      </FormControl>

      {/* Payment Date */}
      <FormControl>
        <FormLabel>Ngày thanh toán</FormLabel>
        <Input
          type='datetime-local'
          value={formData.payment_date}
          onChange={e => onInputChange('payment_date', e.target.value)}
          isDisabled={disabled}
        />
      </FormControl>

      {/* Image Upload */}
      <FormControl>
        <FormLabel>Hình ảnh đính kèm</FormLabel>
        <ImageUpload
          images={formData.payment_images}
          onUpload={onImageUpload}
          onRemove={onImageRemove}
          maxImages={10}
          disabled={disabled}
        />
      </FormControl>

      {/* Notes */}
      <FormControl>
        <FormLabel>Ghi chú</FormLabel>
        <Textarea
          placeholder='Nhập ghi chú (nếu có)'
          value={formData.notes}
          onChange={e => onInputChange('notes', e.target.value)}
          rows={3}
          isDisabled={disabled}
        />
      </FormControl>
    </VStack>
  );
};

export default PaymentForm;
