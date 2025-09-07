import React from 'react';
import { Tabs, TabPanels, TabPanel } from '@chakra-ui/react';
import InvoiceTabList from '../../../molecules/sales/InvoiceTabList';
import InvoiceTabManager from '../../../sales/InvoiceTabManager';

const InvoiceTabsManager = ({ 
  invoices, 
  activeTab, 
  onTabChange, 
  onCloseTab, 
  onCreateNew, 
  onUpdateInvoice,
  onInvoiceCreated
}) => {
  return (
    <Tabs index={activeTab} onChange={onTabChange} variant="enclosed">
      <InvoiceTabList
        invoices={invoices}
        onCloseTab={onCloseTab}
        onCreateNew={onCreateNew}
      />
      
      <TabPanels>
        {invoices.map((invoice, index) => (
          <TabPanel key={invoice.id}>
            <InvoiceTabManager
              invoice={invoice}
              onUpdate={(updatedInvoice) => onUpdateInvoice(index, updatedInvoice)}
              onInvoiceCreated={onInvoiceCreated}
            />
          </TabPanel>
        ))}
      </TabPanels>
    </Tabs>
  );
};

export default InvoiceTabsManager;
