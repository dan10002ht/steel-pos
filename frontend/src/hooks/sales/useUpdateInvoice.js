import { useState } from 'react';
import { useEditApi } from '../useEditApi';
import { useToast } from '@chakra-ui/react';
import { TOAST_DURATION } from '../../constants/options';

export const useUpdateInvoice = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const editApi = useEditApi();
  const toast = useToast();

  const updateInvoice = async (invoiceId, invoiceData) => {
    setIsUpdating(true);
    
    try {
      // Transform frontend data to backend format
      const payload = {
        customer_phone: invoiceData.customer?.phone || '',
        customer_name: invoiceData.customer?.name || '',
        customer_address: invoiceData.customer?.address || null,
        items: invoiceData.items.map(item => ({
          id: item.id || null, // For existing items
          product_id: item.productId || null,
          variant_id: item.variantId || null,
          product_name: item.productName,
          variant_name: item.variantName,
          unit: item.unit,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          product_notes: item.productNotes || null,
          is_deleted: item.isDeleted || false,
        })),
        discount_amount: invoiceData.discount || 0,
        discount_percentage: 0, // Can be added later if needed
        tax_amount: 0, // Can be added later if needed
        tax_percentage: 0, // Can be added later if needed
        payment_method: invoiceData.paymentMethod || null,
        paid_amount: invoiceData.paidAmount || 0,
        status: invoiceData.status || 'confirmed',
        notes: invoiceData.notes || null,
      };

      const response = await editApi(`/invoices/${invoiceId}`, payload);
      
      toast({
        title: "Cập nhật hoá đơn thành công",
        description: `Hoá đơn ${response.invoice_code} đã được cập nhật`,
        status: "success",
        duration: TOAST_DURATION.MEDIUM,
        isClosable: true,
      });

      return response;
    } catch (error) {
      console.error('Error updating invoice:', error);
      
      toast({
        title: "Lỗi cập nhật hoá đơn",
        description: error.message || "Có lỗi xảy ra khi cập nhật hoá đơn",
        status: "error",
        duration: TOAST_DURATION.LONG,
        isClosable: true,
      });
      
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    updateInvoice,
    isUpdating,
  };
};


