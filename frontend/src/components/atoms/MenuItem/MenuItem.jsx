import React from "react";
import { Button, HStack, Text, VStack } from "@chakra-ui/react";
import { useColorModeValue } from "@chakra-ui/react";

const MenuItem = ({ 
  item, 
  isActive, 
  onClick, 
  hasSubItems = false,
  isSubItem = false 
}) => {
  const hoverBg = useColorModeValue("gray.50", "gray.700");

  return (
    <Button
      variant={isActive ? "solid" : "ghost"}
      colorScheme={isActive ? "blue" : "gray"}
      justifyContent="flex-start"
      w="full"
      h="auto"
      py={isSubItem ? 2 : 3}
      px={4}
      size={isSubItem ? "sm" : "md"}
      onClick={onClick}
      _hover={{
        bg: isActive ? "blue.600" : hoverBg,
      }}
      transition="all 0.2s"
    >
      <HStack spacing={3} w="full">
        {!isSubItem && item.icon}
        <Text fontSize="sm" fontWeight="medium">
          {item.label}
        </Text>
      </HStack>
    </Button>
  );
};

export default MenuItem;
