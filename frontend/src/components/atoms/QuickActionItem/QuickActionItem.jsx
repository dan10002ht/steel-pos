import React from 'react';
import { Box, HStack, Text, Icon } from '@chakra-ui/react';

const QuickActionItem = ({ icon, label, color = "blue", onClick, ...props }) => {
  return (
    <Box
      p={4}
      border="1px"
      borderColor={`${color}.200`}
      borderRadius="md"
      bg={`${color}.50`}
      cursor="pointer"
      _hover={{ bg: `${color}.100` }}
      transition="all 0.2s"
      onClick={onClick}
      {...props}
    >
      <HStack spacing={3}>
        <Icon as={icon} color={`${color}.500`} boxSize={5} />
        <Text fontWeight="medium">{label}</Text>
      </HStack>
    </Box>
  );
};

export default QuickActionItem;
