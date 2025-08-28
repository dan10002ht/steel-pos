import React from "react";
import {
  Box,
  Grid,
  GridItem,
  VStack,
} from "@chakra-ui/react";
import ProductSearch from "./ProductSearch";
import InvoiceForm from "./InvoiceForm";

const InvoiceTabManager = ({ invoice, onUpdate }) => {
  return (
    <Grid templateColumns="repeat(12, 1fr)" gap={6} h="calc(100vh - 200px)">
      {/* Left Panel - Product Search */}
      <GridItem colSpan={{ base: 12, lg: 5 }}>
        <ProductSearch 
          invoice={invoice}
          onUpdate={onUpdate}
        />
      </GridItem>

      {/* Right Panel - Invoice Form */}
      <GridItem colSpan={{ base: 12, lg: 7 }}>
        <InvoiceForm 
          invoice={invoice}
          onUpdate={onUpdate}
        />
      </GridItem>
    </Grid>
  );
};

export default InvoiceTabManager;

