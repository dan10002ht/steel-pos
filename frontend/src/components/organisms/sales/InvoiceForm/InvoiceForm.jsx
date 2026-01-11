import React, { useState } from 'react';
import { Box, VStack, Card, CardBody, Text, useToast } from '@chakra-ui/react';
import CustomerForm from '@/components/molecules/sales/CustomerForm';
import InvoiceItemList from '@/components/molecules/sales/InvoiceItemList';
import InvoiceSummary from '@/components/molecules/sales/InvoiceSummary';
import { useInvoiceReservation } from '@/hooks/useInvoiceReservation';

const InvoiceForm = ({
  invoice,
  onUpdate,
  onInvoiceCreated,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const toast = useToast();

  const { getAvailableStock, setReservation, removeReservation } =
    useInvoiceReservation();

  // Early return if invoice is not loaded yet
  if (!invoice) {
    return (
      <Box textAlign='center' py={8}>
        <Text color='gray.500'>Đang tải dữ liệu hóa đơn...</Text>
      </Box>
    );
  }

  const handleUpdateItem = (itemId, field, value) => {
    const item = invoice.items.find(i => i.id === itemId);
    if (!item) return;

    // Validate quantity against available stock
    if (field === 'quantity') {
      const availableStock = getAvailableStock(item.variantId, invoice.id);

      if (value > availableStock) {
        toast({
          title: 'Không đủ hàng trong kho',
          description: `Chỉ còn ${availableStock} sản phẩm khả dụng (bao gồm cả số lượng đã chọn)`,
          status: 'warning',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      // Update reservation
      setReservation(invoice.id, item.variantId, value);
    }

    const updatedItems = invoice.items.map(i => {
      if (i.id === itemId) {
        const updatedItem = { ...i, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
          updatedItem.totalPrice =
            (updatedItem.quantity || 0) * (updatedItem.unitPrice || 0);
        }
        return updatedItem;
      }
      return i;
    });

    const updatedInvoice = {
      ...invoice,
      items: updatedItems,
    };

    onUpdate(updatedInvoice);
  };
  const handleSelectCustomer = selectedCustomer => {
    onUpdate({ ...invoice, ...selectedCustomer });
  };

  const handleRemoveItem = itemId => {
    const item = invoice.items.find(i => i.id === itemId);
    if (!item) return;

    // Remove reservation
    removeReservation(invoice.id, item.variantId);

    const updatedItems = invoice.items.filter(i => i.id !== itemId);
    const updatedInvoice = {
      ...invoice,
      items: updatedItems,
    };

    onUpdate(updatedInvoice);

    toast({
      title: 'Đã xóa sản phẩm',
      description: 'Sản phẩm đã được xóa khỏi hoá đơn',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  const handleUpdateInvoice = (field, value) => {
    const updatedInvoice = {
      ...invoice,
      [field]: value,
    };

    onUpdate(updatedInvoice);
  };

  const handleCustomerUpdate = (field, value) => {
    const updatedInvoice = {
      ...invoice,
      [field]: value,
    };
    onUpdate(updatedInvoice);
  };

  const handleCreateInvoice = async (invoiceData = null) => {
    // Use provided invoiceData or fallback to invoice from state
    const invoiceToCreate = invoiceData || invoice;

    if (invoiceToCreate.items.length === 0) {
      toast({
        title: 'Hoá đơn trống',
        description: 'Vui lòng thêm ít nhất một sản phẩm',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Validate required customer fields
    if (!invoiceToCreate.customer_name || !invoiceToCreate.customer_phone) {
      toast({
        title: 'Thiếu thông tin khách hàng',
        description: 'Vui lòng nhập đầy đủ tên và số điện thoại khách hàng',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsCreating(true);

    try {
      // Call parent callback to handle invoice creation
      if (onInvoiceCreated) {
        await onInvoiceCreated(invoiceToCreate);
      }
    } catch (error) {
      console.error('Failed to create invoice:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <VStack spacing={4} align='stretch' h='full'>
      {/* Customer Information */}
      <Card>
        <CardBody>
          <Text fontSize='lg' fontWeight='bold' mb={4}>
            Thông tin khách hàng
          </Text>
          <CustomerForm
            customer={{
              id: invoice.customer_id,
              name: invoice.customer_name,
              phone: invoice.customer_phone,
              address: invoice.customer_address,
            }}
            onUpdate={handleCustomerUpdate}
            onSelectCustomer={handleSelectCustomer}
          />
        </CardBody>
      </Card>

      {/* Invoice Items */}
      <Card flex={1}>
        <CardBody>
          <Text fontSize='lg' fontWeight='bold' mb={4}>
            Danh sách sản phẩm
          </Text>

          <InvoiceItemList
            items={invoice.items}
            invoiceId={invoice.id}
            onUpdateItem={handleUpdateItem}
            onRemoveItem={handleRemoveItem}
          />
        </CardBody>
      </Card>

      {/* Invoice Summary */}
      <Card>
        <CardBody>
          <InvoiceSummary
            invoice={invoice}
            onUpdateInvoice={handleUpdateInvoice}
            onCreateInvoice={handleCreateInvoice}
            isDisabled={invoice.items.length === 0 || isCreating}
            isLoading={isCreating}
          />
        </CardBody>
      </Card>
    </VStack>
  );
};

export default InvoiceForm;
