import React from 'react';
import { Card, CardHeader, CardBody, Heading, VStack } from '@chakra-ui/react';
import QuickActionItem from '../../../atoms/QuickActionItem';

const QuickActions = ({ actions, ...props }) => {
  return (
    <Card shadow="sm" {...props}>
      <CardHeader>
        <Heading size="md">Thao tác nhanh</Heading>
      </CardHeader>
      <CardBody>
        <VStack spacing={3} align="stretch">
          {actions.map((action, index) => (
            <QuickActionItem
              key={index}
              icon={action.icon}
              label={action.label}
              color={action.color}
              onClick={action.onClick}
            />
          ))}
        </VStack>
      </CardBody>
    </Card>
  );
};

export default QuickActions;
