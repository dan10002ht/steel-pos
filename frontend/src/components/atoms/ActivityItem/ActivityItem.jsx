import React from 'react';
import { Box, HStack, VStack, Text } from '@chakra-ui/react';

const ActivityItem = ({ title, description, time, ...props }) => {
  return (
    <Box
      p={4}
      border="1px"
      borderColor="gray.200"
      borderRadius="md"
      bg="gray.50"
      {...props}
    >
      <HStack justify="space-between" align="flex-start" w="full">
        <VStack align="flex-start" spacing={1} flex={1}>
          <Text fontWeight="medium" fontSize="sm">
            {title}
          </Text>
          <Text fontSize="xs" color="gray.600">
            {description}
          </Text>
        </VStack>
        <Text fontSize="xs" color="gray.500" flexShrink={0}>
          {time}
        </Text>
      </HStack>
    </Box>
  );
};

export default ActivityItem;
