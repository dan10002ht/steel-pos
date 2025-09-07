import { useState } from 'react';
import { useCreateApi } from '../useCreateApi';
import { useToast } from '@chakra-ui/react';
import { TOAST_DURATION } from '../../constants/options';

export const useCreateInvoice = () => {
  const [isCreating, setIsCreating] = useState(false);
  const createApi = useCreateApi();
  const toast = useToast();

  const createInvoice = async (invoiceData) => {
    setIsCreating(true);
    
    try {
      // Transform frontend data to backend format
      const payload = {
        customer_phone: invoiceData.customer?.phone || '',
        customer_name: invoiceData.customer?.name || '',
        customer_address: invoiceData.customer?.address || null,
        items: invoiceData.items.map(item => ({
          product_id: item.productId || null,
          variant_id: item.variantId || null,
          product_name: item.productName,
          variant_name: item.variantName,
          unit: item.unit,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          product_notes: item.productNotes || null,
        })),
        discount_amount: invoiceData.discount || 0,
        discount_percentage: 0, // Can be added later if needed
        tax_amount: 0, // Can be added later if needed
        tax_percentage: 0, // Can be added later if needed
        payment_method: invoiceData.paymentMethod || null,
        paid_amount: invoiceData.paidAmount || 0,
        notes: invoiceData.notes || null,
      };

      const response = await createApi('/invoices', payload);
      
      toast({
        title: "Tạo hoá đơn thành công",
        description: `Hoá đơn ${response.invoice_code} đã được tạo`,
        status: "success",
        duration: TOAST_DURATION.MEDIUM,
        isClosable: true,
      });

      return response;
    } catch (error) {
      console.error('Error creating invoice:', error);
      
      toast({
        title: "Lỗi tạo hoá đơn",
        description: error.message || "Có lỗi xảy ra khi tạo hoá đơn",
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
    createInvoice,
    isCreating,
  };
};


