import React from "react";
import { Box, Heading, Text, VStack } from "@chakra-ui/react";
import ImportOrderForm from "../../components/ImportOrderForm";

const InventoryCreate = () => {
  return (
    <Box>
      <VStack spacing={6} align="stretch">
        {/* Page Header */}
        <Box>
          <Heading size="lg" mb={2}>
            Tạo đơn nhập kho
          </Heading>
          <Text color="gray.600">
            Tạo đơn nhập kho mới và quản lý thông tin nhập hàng
          </Text>
        </Box>

        {/* Import Order Form */}
        <ImportOrderForm />
      </VStack>
    </Box>
  );
};

export default InventoryCreate;
