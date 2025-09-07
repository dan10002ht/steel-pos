import React from 'react';
import { TabList, Button } from '@chakra-ui/react';
import { Plus } from 'lucide-react';
import InvoiceTab from '../InvoiceTab';

const InvoiceTabList = ({ invoices, onCloseTab, onCreateNew }) => {
  return (
    <TabList>
      {invoices.map((invoice, index) => (
        <InvoiceTab
          key={invoice.id}
          invoice={invoice}
          onClose={() => onCloseTab(index)}
        />
      ))}
      <Button
        leftIcon={<Plus size={16} />}
        variant="ghost"
        onClick={onCreateNew}
        ml={2}
      >
        Tạo mới
      </Button>
    </TabList>
  );
};

export default InvoiceTabList;
