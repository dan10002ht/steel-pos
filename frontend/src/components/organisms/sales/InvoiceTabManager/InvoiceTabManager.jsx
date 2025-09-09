import React from "react";
import {
  Box,
  Grid,
  GridItem,
  VStack,
} from "@chakra-ui/react";
import ProductVariantsSearch from "@/components/molecules/sales/ProductVariantsSearch";
import InvoiceForm from "@/components/organisms/sales/InvoiceForm";

const InvoiceTabManager = ({ invoice, onUpdate, onInvoiceCreated }) => {
  return (
    <Grid templateColumns="repeat(12, 1fr)" gap={6} h="calc(100vh - 200px)">
      {/* Left Panel - Product Search */}
      <GridItem colSpan={{ base: 12, lg: 5 }}>
        <ProductVariantsSearch
          invoice={invoice}
          onUpdate={onUpdate}
        />
      </GridItem>

      {/* Right Panel - Invoice Form */}
      <GridItem colSpan={{ base: 12, lg: 7 }}>
        <InvoiceForm
          invoice={invoice}
          onUpdate={onUpdate}
          onInvoiceCreated={onInvoiceCreated}
        />
      </GridItem>
    </Grid>
  );
};

export default InvoiceTabManager;


