import React from 'react';
import { Box, Text } from '@chakra-ui/react';

const PageHeader = ({ title, subtitle, ...props }) => {
  return (
    <Box {...props}>
      <Text fontSize="2xl" fontWeight="bold" mb={2}>
        {title}
      </Text>
      {subtitle && (
        <Text color="gray.600">
          {subtitle}
        </Text>
      )}
    </Box>
  );
};

export default PageHeader;
