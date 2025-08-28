import React, { useState } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  useToast,
} from "@chakra-ui/react";
import { Plus, X } from "lucide-react";
import InvoiceTabManager from "../../components/sales/InvoiceTabManager";
import ProductSearch from "../../components/sales/ProductSearch";
import InvoiceForm from "../../components/sales/InvoiceForm";

const SalesCreatePage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [invoices, setInvoices] = useState([
    {
      id: 1,
      code: "Hoá đơn 1",
      items: [],
      customer: null,
      notes: "",
      discount: 0,
      paymentMethod: "",
    },
  ]);
  const toast = useToast();

  const handleCreateNewInvoice = () => {
    const newInvoice = {
      id: Date.now(),
      code: `Hoá đơn ${invoices.length + 1}`,
      items: [],
      customer: null,
      notes: "",
      discount: 0,
      paymentMethod: "",
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
        duration: 3000,
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

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        {/* Page Header */}
        <Box>
          <Text fontSize="2xl" fontWeight="bold" mb={2}>
            Tạo hoá đơn mới
          </Text>
          <Text color="gray.600">Quản lý và tạo hoá đơn bán hàng</Text>
        </Box>

        {/* Invoice Tabs */}
        <Box>
          <Tabs index={activeTab} onChange={setActiveTab} variant="enclosed">
            <TabList>
              {invoices.map((invoice, index) => (
                <Tab key={invoice.id}>
                  <HStack spacing={2}>
                    <Text>{invoice.code}</Text>
                    <Box
                      as="span"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCloseTab(index);
                      }}
                      cursor="pointer"
                      p={1}
                      borderRadius="md"
                      _hover={{ bg: "red.100" }}
                      color="red.500"
                    >
                      <X size={12} />
                    </Box>
                  </HStack>
                </Tab>
              ))}
              <Button
                leftIcon={<Plus size={16} />}
                variant="ghost"
                onClick={handleCreateNewInvoice}
                ml={2}
              >
                Tạo mới
              </Button>
            </TabList>

            <TabPanels>
              {invoices.map((invoice, index) => (
                <TabPanel key={invoice.id}>
                  <InvoiceTabManager
                    invoice={invoice}
                    onUpdate={(updatedInvoice) =>
                      handleUpdateInvoice(index, updatedInvoice)
                    }
                  />
                </TabPanel>
              ))}
            </TabPanels>
          </Tabs>
        </Box>
      </VStack>
    </Box>
  );
};

export default SalesCreatePage;
