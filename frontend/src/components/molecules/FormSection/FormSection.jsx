import React from 'react';
import { VStack, Heading, Divider, HStack, Button } from '@chakra-ui/react';

const FormSection = ({
  title,
  children,
  spacing = 4,
  divider = true,
  primaryActions = [],
  ...props
}) => {
  return (
    <VStack spacing={spacing} align='stretch' {...props}>
      {title && <HStack align='center' justify='space-between'>
        <Heading size={{base: 'sm', md: 'md'}}>{title}</Heading>
        {primaryActions && <HStack align='center'>
          {primaryActions.map((action, index) => (
            <Button key={index} {...action}>{action.label}</Button>
          ))}
        </HStack>}
      </HStack>}
      {children}
      {divider && <Divider />}
    </VStack>
  );
};

export default FormSection;
