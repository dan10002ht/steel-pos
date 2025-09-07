import React, { useState } from "react";
import {
  Box,
  VStack,
  useToast,
} from "@chakra-ui/react";
import PageHeader from "../../components/atoms/PageHeader";
import InvoiceTabsManager from "../../components/organisms/sales/InvoiceTabsManager";
import { PAYMENT_METHODS, TOAST_DURATION } from "../../constants/options";
import { useCreateApi } from "../../hooks/useCreateApi";

const SalesCreatePage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [invoices, setInvoices] = useState([
    {
      id: 1,
      code: "Hoá đơn 1",
      items: [],
      customer_id: null,
      customer_name: "",
      customer_phone: "",
      customer_address: "",
      notes: "",
      discount: 0,
      paymentMethod: "",
      paidAmount: 0,
    },
  ]);
  const toast = useToast();
  const createInvoiceMutation = useCreateApi('/invoices');

  const handleCreateNewInvoice = () => {
    const newInvoice = {
      id: Date.now(),
      code: `Hoá đơn ${invoices.length + 1}`,
      items: [],
      customer_id: null,
      customer_name: "",
      customer_phone: "",
      customer_address: "",
      notes: "",
      discount: 0,
      paymentMethod: "",
      paidAmount: 0,
    };
    setInvoices([...invoices, newInvoice]);
    setActiveTab(invoices.length);
  };

  const handleCloseTab = (index) => {
    if (invoices.length === 1) {
      toast({
        title: "Không thể đóng",
        description: "Phải có ít nhất một hoá đơn",
        status: "warning",
        duration: TOAST_DURATION.MEDIUM,
        isClosable: true,
      });
      return;
    }

    const newInvoices = invoices.filter((_, i) => i !== index);
    setInvoices(newInvoices);

    if (activeTab >= index && activeTab > 0) {
      setActiveTab(activeTab - 1);
    } else if (activeTab === index && index > 0) {
      setActiveTab(index - 1);
    }
  };

  const handleUpdateInvoice = (index, updatedInvoice) => {
    const newInvoices = [...invoices];
    newInvoices[index] = { ...newInvoices[index], ...updatedInvoice };
    setInvoices(newInvoices);
  };

  const handleInvoiceCreated = async (createdInvoice) => {
    try {
      // Transform frontend data to backend format
      const payload = {
        customer_id: createdInvoice.customer_id || null,
        customer_phone: createdInvoice.customer_phone || '',
        customer_name: createdInvoice.customer_name || '',
        customer_address: createdInvoice.customer_address || null,
        items: createdInvoice.items.map(item => ({
          product_id: item.productId || null,
          variant_id: item.variantId || null,
          product_name: item.productName,
          variant_name: item.variantName,
          unit: item.unit,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          product_notes: item.productNotes || null,
        })),
        discount_amount: createdInvoice.discount || 0,
        discount_percentage: 0,
        tax_amount: 0,
        tax_percentage: 0,
        payment_method: createdInvoice.paymentMethod || null,
        paid_amount: createdInvoice.paidAmount || 0,
        notes: createdInvoice.notes || null,
      };

      const response = await createInvoiceMutation.mutateAsync(payload);
      
      toast({
        title: "Tạo hoá đơn thành công",
        description: `Hoá đơn ${response.invoice_code} đã được tạo`,
        status: "success",
        duration: TOAST_DURATION.MEDIUM,
        isClosable: true,
      });

      // Update the invoice with the created data
      const newInvoices = [...invoices];
      newInvoices[activeTab] = {
        ...newInvoices[activeTab],
        id: response.id,
        code: response.invoice_code,
        status: 'created',
      };
      setInvoices(newInvoices);

      // Create a new empty invoice for next use
      handleCreateNewInvoice();

    } catch (error) {
      console.error('Error creating invoice:', error);
      
      toast({
        title: "Lỗi tạo hoá đơn",
        description: error.message || "Có lỗi xảy ra khi tạo hoá đơn",
        status: "error",
        duration: TOAST_DURATION.LONG,
        isClosable: true,
      });
    }
  };

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        <PageHeader
          title="Tạo hoá đơn mới"
          subtitle="Quản lý và tạo hoá đơn bán hàng"
        />
        
        <InvoiceTabsManager
          invoices={invoices}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onCloseTab={handleCloseTab}
          onCreateNew={handleCreateNewInvoice}
          onUpdateInvoice={handleUpdateInvoice}
          onInvoiceCreated={handleInvoiceCreated}
        />
      </VStack>
    </Box>
  );
};

export default SalesCreatePage;
