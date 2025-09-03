import React from "react";
import { Box, HStack, VStack, Text } from "@chakra-ui/react";

const Logo = () => {
  return (
    <HStack spacing={3}>
      <Box
        w="10"
        h="10"
        bg="blue.500"
        borderRadius="lg"
        display="flex"
        alignItems="center"
        justifyContent="center"
        color="white"
      >
        <Text fontSize="lg" fontWeight="bold">
          KP
        </Text>
      </Box>
      <VStack align="flex-start" spacing={0}>
        <Text fontSize={{base: "md", md: "lg"}} fontWeight="bold" color="gray.800">
          Kiên Phước
        </Text>
        <Text fontSize={{base: "xs", md: "sm"}} color="gray.500">
          Point of Sale System
        </Text>
      </VStack>
    </HStack>
  );
};

export default Logo;
