import React from "react";
import { Box } from "@chakra-ui/react";
import ImportOrderForm from "../components/ImportOrderForm";

const ImportOrderPage = () => {
  return (
    <Box minH="100vh" bg="gray.50">
      <ImportOrderForm />
    </Box>
  );
};

export default ImportOrderPage;
