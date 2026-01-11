import React, { useState, useEffect } from 'react';
import { useToast } from '@chakra-ui/react';
import Page from '../../components/organisms/Page/Page';
import InvoiceTabsManager from '../../components/organisms/sales/InvoiceTabsManager';
import { TOAST_DURATION } from '../../constants/options';
import { useCreateApi } from '../../hooks/useCreateApi';
import { generateDefaultInvoice } from '../../utils/invoiceHelpers';
import { useInvoiceReservation } from '../../hooks/useInvoiceReservation';

const INVOICES_STORAGE_KEY = 'draft_invoices';
const ACTIVE_TAB_STORAGE_KEY = 'draft_invoices_active_tab';

const SalesCreatePage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [invoices, setInvoices] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const toast = useToast();
  const { clearInvoiceReservations } = useInvoiceReservation();

  const createInvoiceMutation = useCreateApi('/invoices', {
    invalidateQueries: [
      ['invoices'],
      query => query.queryKey[0] === 'inventory-logs',
    ],
  });

  // Load invoices from localStorage on mount
  useEffect(() => {
    try {
      const savedInvoices = localStorage.getItem(INVOICES_STORAGE_KEY);
      const savedActiveTab = localStorage.getItem(ACTIVE_TAB_STORAGE_KEY);

      if (savedInvoices) {
        const parsed = JSON.parse(savedInvoices);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setInvoices(parsed);
          if (savedActiveTab) {
            const tabIndex = parseInt(savedActiveTab, 10);
            if (tabIndex >= 0 && tabIndex < parsed.length) {
              setActiveTab(tabIndex);
            }
          }
          setIsInitialized(true);
          return;
        }
      }
    } catch (error) {
      console.error('Failed to load draft invoices from localStorage:', error);
    }

    // Nếu không có saved data, tạo invoice mặc định
    setInvoices([generateDefaultInvoice('1')]);
    setIsInitialized(true);
  }, []);

  // Save invoices to localStorage whenever they change
  useEffect(() => {
    if (!isInitialized) return;

    try {
      localStorage.setItem(INVOICES_STORAGE_KEY, JSON.stringify(invoices));
    } catch (error) {
      console.error('Failed to save draft invoices to localStorage:', error);
    }
  }, [invoices, isInitialized]);

  // Save active tab to localStorage
  useEffect(() => {
    if (!isInitialized) return;

    try {
      localStorage.setItem(ACTIVE_TAB_STORAGE_KEY, activeTab.toString());
    } catch (error) {
      console.error('Failed to save active tab to localStorage:', error);
    }
  }, [activeTab, isInitialized]);

  // Show loading while initializing
  if (!isInitialized) {
    return null;
  }

  const handleCreateNewInvoice = () => {
    const newInvoice = generateDefaultInvoice((invoices.length + 1).toString());
    setInvoices([...invoices, newInvoice]);
    setActiveTab(invoices.length);
  };

  const handleCloseTab = index => {
    if (invoices.length === 1) {
      toast({
        title: 'Không thể đóng',
        description: 'Phải có ít nhất một hoá đơn',
        status: 'warning',
        duration: TOAST_DURATION.MEDIUM,
        isClosable: true,
      });
      return;
    }

    const closingInvoice = invoices[index];

    // Clear reservations for this invoice
    clearInvoiceReservations(closingInvoice.id);

    setInvoices(prev => [...prev].filter((_, i) => i !== index));

    if (activeTab >= index && activeTab > 0) {
      setActiveTab(activeTab - 1);
    } else if (activeTab === index && index > 0) {
      setActiveTab(index - 1);
    }
  };

  const handleUpdateInvoice = (index, updatedInvoice) => {
    const newInvoices = [...invoices];
    newInvoices[index] = { ...newInvoices[index], ...updatedInvoice };
    setInvoices(newInvoices);
  };

  const handleInvoiceCreated = async createdInvoice => {
    try {
      // Transform frontend data to backend format
      const payload = {
        customer_id: createdInvoice.customer_id || null,
        customer_phone: createdInvoice.customer_phone || '',
        customer_name: createdInvoice.customer_name || '',
        customer_address: createdInvoice.customer_address || null,
        items: createdInvoice.items.map(item => ({
          product_id: item.productId || null,
          variant_id: item.variantId || null,
          product_name: item.productName,
          variant_name: item.variantName,
          unit: item.unit,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          product_notes: item.productNotes || null,
        })),
        discount_amount: createdInvoice.discount || 0,
        discount_percentage: 0,
        tax_amount: 0,
        tax_percentage: 0,
        payment_method: createdInvoice.paymentMethod || null,
        paid_amount: createdInvoice.paidAmount || 0,
        notes: createdInvoice.notes || null,
        invoice_images: createdInvoice.invoiceImages || null,
      };

      const { data, success } =
        await createInvoiceMutation.mutateAsync(payload);
      if (success) {
        toast({
          title: 'Tạo hoá đơn thành công',
          description: `Hoá đơn ${data.invoice_code} đã được tạo`,
          status: 'success',
          duration: TOAST_DURATION.MEDIUM,
          isClosable: true,
        });

        // Clear reservations for this invoice
        clearInvoiceReservations(createdInvoice.id);

        // Remove the created invoice from the list
        setInvoices(prev =>
          [...prev].filter((_, index) => index !== activeTab)
        );

        // Switch to the first tab if current tab was removed
        if (activeTab > invoices.length - 1) {
          setActiveTab(0);
        }
      }
    } catch (error) {
      console.error('Error creating invoice:', error);

      toast({
        title: 'Lỗi tạo hoá đơn',
        description: error.message || 'Có lỗi xảy ra khi tạo hoá đơn',
        status: 'error',
        duration: TOAST_DURATION.LONG,
        isClosable: true,
      });
    }
  };

  const handleInvoiceCreatedAndPrint = async createdInvoice => {
    try {
      // Transform frontend data to backend format
      const payload = {
        customer_id: createdInvoice.customer_id || null,
        customer_phone: createdInvoice.customer_phone || '',
        customer_name: createdInvoice.customer_name || '',
        customer_address: createdInvoice.customer_address || null,
        items: createdInvoice.items.map(item => ({
          product_id: item.productId || null,
          variant_id: item.variantId || null,
          product_name: item.productName,
          variant_name: item.variantName,
          unit: item.unit,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          product_notes: item.productNotes || null,
        })),
        discount_amount: createdInvoice.discount || 0,
        discount_percentage: 0,
        tax_amount: 0,
        tax_percentage: 0,
        payment_method: createdInvoice.paymentMethod || null,
        paid_amount: createdInvoice.paidAmount || 0,
        notes: createdInvoice.notes || null,
        invoice_images: createdInvoice.invoiceImages || null,
      };

      const { data, success } =
        await createInvoiceMutation.mutateAsync(payload);
      if (success) {
        toast({
          title: 'Tạo hoá đơn thành công',
          description: `Hoá đơn ${data.invoice_code} đã được tạo và đang mở trang in`,
          status: 'success',
          duration: TOAST_DURATION.MEDIUM,
          isClosable: true,
        });

        // Clear reservations for this invoice
        clearInvoiceReservations(createdInvoice.id);

        // Remove the created invoice from the list
        setInvoices(prev =>
          [...prev].filter((_, index) => index !== activeTab)
        );

        // Switch to the first tab if current tab was removed
        if (activeTab > invoices.length - 1) {
          setActiveTab(0);
        }

        // Open print page in new tab
        const printUrl = `/sales/invoices/${data.id}/print`;
        window.open(printUrl, '_blank');
      }
    } catch (error) {
      console.error('Error creating invoice and print:', error);

      toast({
        title: 'Lỗi tạo hoá đơn',
        description: error.message || 'Có lỗi xảy ra khi tạo hoá đơn',
        status: 'error',
        duration: TOAST_DURATION.LONG,
        isClosable: true,
      });
    }
  };

  return (
    <Page title='Tạo hoá đơn mới' subtitle='Quản lý và tạo hoá đơn bán hàng'>
      <InvoiceTabsManager
        invoices={invoices}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onCloseTab={handleCloseTab}
        onCreateNew={handleCreateNewInvoice}
        onUpdateInvoice={handleUpdateInvoice}
        onInvoiceCreated={handleInvoiceCreated}
      />
    </Page>
  );
};

export default SalesCreatePage;
