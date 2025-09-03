import React from 'react';
import { HStack, Button, Spacer } from '@chakra-ui/react';

const FormActions = ({
  children,
  spacing = 3,
  justify = 'end',
  ...props
}) => {
  return (
    <HStack spacing={spacing} justify={justify} {...props}>
      {children}
    </HStack>
  );
};

export default FormActions;
