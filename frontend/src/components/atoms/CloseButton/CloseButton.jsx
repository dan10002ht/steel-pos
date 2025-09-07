import React from 'react';
import { Box } from '@chakra-ui/react';
import { X } from 'lucide-react';

const CloseButton = ({ onClick, size = 12, ...props }) => {
  return (
    <Box
      as="span"
      onClick={onClick}
      cursor="pointer"
      p={1}
      borderRadius="md"
      _hover={{ bg: "red.100" }}
      color="red.500"
      {...props}
    >
      <X size={size} />
    </Box>
  );
};

export default CloseButton;