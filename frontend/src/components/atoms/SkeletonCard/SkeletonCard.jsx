import React from "react";
import { Card, CardBody, Skeleton, SkeletonText, VStack } from "@chakra-ui/react";

const SkeletonCard = ({ showIcon = true }) => {
  return (
    <Card>
      <CardBody>
        <VStack spacing={3} align="stretch">
          <Skeleton height="20px" width="60%" />
          <Skeleton height="32px" width="40%" />
          {showIcon && (
            <SkeletonText noOfLines={1} spacing="2" skeletonHeight="16px" width="70%" />
          )}
        </VStack>
      </CardBody>
    </Card>
  );
};

export default SkeletonCard;
