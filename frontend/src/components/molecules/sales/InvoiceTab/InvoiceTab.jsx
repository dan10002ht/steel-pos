import React from 'react';
import { Tab, HStack, Text } from '@chakra-ui/react';
import CloseButton from '../../../atoms/CloseButton';

const InvoiceTab = ({ invoice, onClose, ...props }) => {
  const handleClose = (e) => {
    e.stopPropagation();
    onClose();
  };

  return (
    <Tab {...props}>
      <HStack spacing={2}>
        <Text>{invoice.code}</Text>
        <CloseButton onClick={handleClose} />
      </HStack>
    </Tab>
  );
};

export default InvoiceTab;
