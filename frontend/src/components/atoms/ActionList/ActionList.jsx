import React from "react";
import {
  VStack,
  Button,
  Text,
  HStack,
  Divider,
} from "@chakra-ui/react";

const ActionList = ({ actions = [], onActionClick, size = "md" }) => {
  if (!actions || actions.length === 0) return null;

  return (
    <VStack spacing={0} align="stretch" minW="200px">
      {actions.map((action, index) => (
        <React.Fragment key={index}>
          <Button
            variant="ghost"
            size={size}
            justifyContent="flex-start"
            leftIcon={action.icon}
            onClick={() => {
              onActionClick?.(action);
              action.onClick?.();
            }}
            isDisabled={action.isDisabled}
            isLoading={action.isLoading}
            colorScheme={action.colorScheme}
            borderRadius={0}
            _hover={{
              bg: "gray.50",
            }}
            _active={{
              bg: "gray.100",
            }}
          >
            <Text fontSize="sm">{action.label}</Text>
          </Button>
          {index < actions.length - 1 && <Divider />}
        </React.Fragment>
      ))}
    </VStack>
  );
};

export default ActionList;
