import React, { useState } from "react";
import { Box, VStack, Card, CardBody, Text, useToast } from "@chakra-ui/react";
import CustomerForm from "./CustomerForm";
import InvoiceItemList from "./InvoiceItemList";
import InvoiceSummary from "./InvoiceSummary";

const InvoiceForm = ({ invoice, onUpdate }) => {
  const [customer, setCustomer] = useState(invoice.customer || null);
  const toast = useToast();

  const handleUpdateItem = (itemId, field, value) => {
    const updatedItems = invoice.items.map((item) => {
      if (item.id === itemId) {
        const updatedItem = { ...item, [field]: value };
        if (field === "quantity" || field === "unitPrice") {
          updatedItem.totalPrice = updatedItem.quantity * updatedItem.unitPrice;
        }
        return updatedItem;
      }
      return item;
    });

    const updatedInvoice = {
      ...invoice,
      items: updatedItems,
    };

    onUpdate(updatedInvoice);
  };

  const handleRemoveItem = (itemId) => {
    const updatedItems = invoice.items.filter((item) => item.id !== itemId);
    const updatedInvoice = {
      ...invoice,
      items: updatedItems,
    };

    onUpdate(updatedInvoice);

    toast({
      title: "Đã xóa sản phẩm",
      description: "Sản phẩm đã được xóa khỏi hoá đơn",
      status: "success",
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

  const handleCustomerUpdate = (newCustomer) => {
    setCustomer(newCustomer);
    handleUpdateInvoice("customer", newCustomer);
  };

  const handleCreateInvoice = () => {
    if (!customer) {
      toast({
        title: "Thiếu thông tin khách hàng",
        description: "Vui lòng nhập thông tin khách hàng",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (invoice.items.length === 0) {
      toast({
        title: "Hoá đơn trống",
        description: "Vui lòng thêm ít nhất một sản phẩm",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // TODO: Implement API call to create invoice
    toast({
      title: "Chức năng đang phát triển",
      description: "Tính năng tạo hoá đơn sẽ được cập nhật sau",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <VStack spacing={4} align="stretch" h="full">
      {/* Customer Information */}
      <Card>
        <CardBody>
          <Text fontSize="lg" fontWeight="bold" mb={4}>
            Thông tin khách hàng
          </Text>
          <CustomerForm customer={customer} onUpdate={handleCustomerUpdate} />
        </CardBody>
      </Card>

      {/* Invoice Items */}
      <Card flex={1}>
        <CardBody>
          <Text fontSize="lg" fontWeight="bold" mb={4}>
            Danh sách sản phẩm
          </Text>

          <InvoiceItemList
            items={invoice.items}
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
            isDisabled={!customer || invoice.items.length === 0}
          />
        </CardBody>
      </Card>
    </VStack>
  );
};

export default InvoiceForm;
