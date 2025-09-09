import React from "react";
import { HStack, Skeleton, VStack } from "@chakra-ui/react";

const SkeletonListItem = () => {
  return (
    <HStack
      p={3}
      border="1px"
      borderColor="gray.200"
      borderRadius="md"
      spacing={4}
    >
      <VStack flex="1" align="start" spacing={2}>
        <Skeleton height="16px" width="120px" />
        <Skeleton height="14px" width="80px" />
      </VStack>
      <VStack align="end" spacing={2}>
        <Skeleton height="16px" width="100px" />
        <Skeleton height="20px" width="60px" borderRadius="md" />
      </VStack>
    </HStack>
  );
};

export default SkeletonListItem;
