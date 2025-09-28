import React from 'react';
import { Tab, HStack, Text } from '@chakra-ui/react';
import CloseButton from '../../../atoms/CloseButton';

const InvoiceTab = ({ invoice, onClose, isActive, ...props }) => {
  const handleClose = e => {
    e.stopPropagation();
    onClose();
  };

  return (
    <Tab {...props} bg={isActive ? 'white' : 'gray.50'}>
      <HStack spacing={2}>
        <Text>{invoice.code}</Text>
        <CloseButton onClick={handleClose} />
      </HStack>
    </Tab>
  );
};

export default InvoiceTab;
