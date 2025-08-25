import React from "react";
import { Box } from "@chakra-ui/react";
import ImportOrderList from "../components/ImportOrderList";

const ImportOrderListPage = () => {
  return (
    <Box minH="100vh" bg="gray.50">
      <ImportOrderList />
    </Box>
  );
};

export default ImportOrderListPage;
