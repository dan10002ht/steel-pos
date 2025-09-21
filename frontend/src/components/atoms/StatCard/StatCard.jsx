import React from 'react';
import { Card, CardBody, HStack, VStack, Text, Icon } from '@chakra-ui/react';

const StatCard = ({ label, value,  icon: IconComponent, color, ...props }) => {
  
  return (
    <Card shadow="sm" {...props}>
      <CardBody>
        <HStack justify="space-between" align="flex-start" w="full">
          <VStack align="flex-start" spacing={1} flex={1}>
            <Text color="gray.600" fontSize="sm" fontWeight="medium">
              {label}
            </Text>
            <Text fontSize="2xl" fontWeight="bold" color="gray.800">
              {value}
            </Text>
          </VStack>
          <Icon
            as={IconComponent}
            boxSize={8}
            color={`${color}.500`}
            opacity={0.8}
            flexShrink={0}
          />
        </HStack>
      </CardBody>
    </Card>
  );
};

export default StatCard;
