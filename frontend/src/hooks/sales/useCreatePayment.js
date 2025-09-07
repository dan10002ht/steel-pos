import { useState } from 'react';
import { useCreateApi } from '../useCreateApi';
import { useToast } from '@chakra-ui/react';
import { TOAST_DURATION } from '../../constants/options';

export const useCreatePayment = () => {
  const [isCreating, setIsCreating] = useState(false);
  const createApi = useCreateApi();
  const toast = useToast();

  const createPayment = async (invoiceId, paymentData) => {
    setIsCreating(true);
    
    try {
      const payload = {
        amount: paymentData.amount,
        payment_method: paymentData.paymentMethod,
        payment_date: paymentData.paymentDate || new Date().toISOString(),
        transaction_reference: paymentData.transactionReference || null,
        notes: paymentData.notes || null,
      };

      const response = await createApi(`/invoice-payments/${invoiceId}`, payload);
      
      toast({
        title: "Tạo thanh toán thành công",
        description: `Thanh toán ${paymentData.amount.toLocaleString('vi-VN')} VNĐ đã được tạo`,
        status: "success",
        duration: TOAST_DURATION.MEDIUM,
        isClosable: true,
      });

      return response;
    } catch (error) {
      console.error('Error creating payment:', error);
      
      toast({
        title: "Lỗi tạo thanh toán",
        description: error.message || "Có lỗi xảy ra khi tạo thanh toán",
        status: "error",
        duration: TOAST_DURATION.LONG,
        isClosable: true,
      });
      
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  return {
    createPayment,
    isCreating,
  };
};


