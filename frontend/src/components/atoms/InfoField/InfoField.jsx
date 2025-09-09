import React from "react";
import { Box, Text } from "@chakra-ui/react";

const InfoField = ({ label, value, isMonospace = false, ...props }) => {
  return (
    <Box flex="1" {...props}>
      <Text fontSize="sm" color="gray.600" mb={1}>
        {label}
      </Text>
      <Text 
        fontSize="md" 
        fontWeight="semibold"
        fontFamily={isMonospace ? "mono" : "inherit"}
      >
        {value}
      </Text>
    </Box>
  );
};

export default InfoField;
