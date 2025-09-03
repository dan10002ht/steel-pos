import React from 'react';
import { HStack } from '@chakra-ui/react';

const FormRow = ({
  children,
  spacing = 4,
  align = 'start',
  ...props
}) => {
  return (
    <HStack spacing={spacing} align={align} {...props}>
      {children}
    </HStack>
  );
};

export default FormRow;
