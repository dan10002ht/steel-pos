import React from "react";
import { Box, Heading, Text, VStack } from "@chakra-ui/react";
import InventoryReport from "../../components/InventoryReport";

const InventoryReportPage = () => {
  return (
    <Box>
      <VStack spacing={6} align="stretch">
        {/* Page Header */}
        <Box>
          <Heading size="lg" mb={2}>
            Báo cáo tồn kho
          </Heading>
          <Text color="gray.600">
            Báo cáo chi tiết về tình trạng tồn kho và hoạt động nhập xuất
          </Text>
        </Box>

        {/* Inventory Report Component */}
        <InventoryReport />
      </VStack>
    </Box>
  );
};

export default InventoryReportPage;
