import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useToast,
  Spinner,
  Center,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import Page from '../../components/organisms/Page/Page';
import InvoiceTabManager from '../../components/organisms/sales/InvoiceTabManager';
import { TOAST_DURATION } from '../../constants/options';
import { useFetchApi } from '../../hooks/useFetchApi';
import { useEditApi } from '../../hooks/useEditApi';

const SalesEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [invoice, setInvoice] = useState(null);

  // Fetch invoice data
  const {
    data: invoiceData,
    isLoading,
    isError,
    error,
  } = useFetchApi(['invoice', id], `/invoices/${id}`, {
    enabled: !!id,
  });

  // Edit invoice mutation
  const editInvoiceMutation = useEditApi('/invoices', {
    invalidateQueries: [['invoice', id], 'invoices'],
  });

  // Transform backend data to frontend format
  useEffect(() => {
    if (invoiceData) {
      const transformedInvoice = {
        id: invoiceData.id,
        code: invoiceData.invoice_code || `Hoá đơn ${invoiceData.id}`,
        items:
          invoiceData.items?.map(item => ({
            id: item.id || Date.now() + Math.random(),
            productId: item.product_id,
            variantId: item.variant_id,
            productName: item.product_name,
            variantName: item.variant_name,
            unit: item.unit,
            quantity: item.quantity,
            unitPrice: item.unit_price,
            totalPrice: (item.quantity || 0) * (item.unit_price || 0),
            productNotes: item.product_notes,
            stock: item.stock || 0,
          })) || [],
        customer_id: invoiceData.customer_id,
        customer_name: invoiceData.customer_name || '',
        customer_phone: invoiceData.customer_phone || '',
        customer_address: invoiceData.customer_address || '',
        notes: invoiceData.notes || '',
        discount: invoiceData.discount_amount || 0,
        paymentMethod: invoiceData.payment_method || '',
        paidAmount: invoiceData.paid_amount || 0,
        invoiceImages: invoiceData.invoice_images || null,
      };

      setInvoice(transformedInvoice);
    }
  }, [invoiceData]);

  const handleUpdateInvoice = updatedInvoice => {
    setInvoice(updatedInvoice);
  };

  const handleInvoiceUpdated = async updatedInvoice => {
    try {
      // Transform frontend data to backend format
      const payload = {
        customer_phone: updatedInvoice.customer_phone || '',
        customer_name: updatedInvoice.customer_name || '',
        customer_address: updatedInvoice.customer_address || null,
        items: updatedInvoice.items.map(item => ({
          product_id: item.productId || null,
          variant_id: item.variantId || null,
          product_name: item.productName,
          variant_name: item.variantName,
          unit: item.unit,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          product_notes: item.productNotes || null,
        })),
        discount_amount: updatedInvoice.discount || 0,
        discount_percentage: 0,
        tax_amount: 0,
        tax_percentage: 0,
        payment_method: updatedInvoice.paymentMethod || null,
        paid_amount: updatedInvoice.paidAmount || 0,
        notes: updatedInvoice.notes || null,
        invoice_images: updatedInvoice.invoiceImages || null,
      };

      await editInvoiceMutation.mutateAsync({
        id: id,
        data: payload,
      });

      toast({
        title: 'Cập nhật hoá đơn thành công',
        description: `Hoá đơn ${invoiceData.invoice_code} đã được cập nhật`,
        status: 'success',
        duration: TOAST_DURATION.MEDIUM,
        isClosable: true,
      });

      navigate(`/sales/detail/${id}`);
    } catch (err) {
      console.error('Error updating invoice:', err);

      toast({
        title: 'Lỗi cập nhật hoá đơn',
        description: err.message || 'Có lỗi xảy ra khi cập nhật hoá đơn',
        status: 'error',
        duration: TOAST_DURATION.LONG,
        isClosable: true,
      });
    }
  };

  if (isLoading) {
    return (
      <Page title='Chỉnh sửa hoá đơn' subtitle='Đang tải dữ liệu...'>
        <Center h='400px'>
          <Spinner size='xl' />
        </Center>
      </Page>
    );
  }

  if (isError) {
    return (
      <Page title='Chỉnh sửa hoá đơn' subtitle='Lỗi tải dữ liệu'>
        <Alert status='error'>
          <AlertIcon />
          <AlertTitle>Không thể tải hoá đơn!</AlertTitle>
          <AlertDescription>
            {error?.message || 'Có lỗi xảy ra khi tải dữ liệu hoá đơn'}
          </AlertDescription>
        </Alert>
      </Page>
    );
  }

  if (!invoiceData) {
    return (
      <Page title='Chỉnh sửa hoá đơn' subtitle='Không tìm thấy hoá đơn'>
        <Alert status='warning'>
          <AlertIcon />
          <AlertTitle>Không tìm thấy hoá đơn!</AlertTitle>
          <AlertDescription>
            Hoá đơn với ID {id} không tồn tại hoặc đã bị xóa
          </AlertDescription>
        </Alert>
      </Page>
    );
  }

  // Only draft invoices can be fully edited
  if (invoiceData.status !== 'draft') {
    return (
      <Page
        title='Chỉnh sửa hoá đơn'
        subtitle={`Hoá đơn ${invoiceData.invoice_code}`}
        onBack={() => navigate(`/sales/detail/${id}`)}
      >
        <Alert status='warning'>
          <AlertIcon />
          <AlertTitle>Không thể chỉnh sửa!</AlertTitle>
          <AlertDescription>
            Chỉ có hoá đơn nháp mới được chỉnh sửa. Hoá đơn này đang ở trạng
            thái &quot;{invoiceData.status}&quot;.
          </AlertDescription>
        </Alert>
      </Page>
    );
  }

  return (
    <Page
      title='Chỉnh sửa hoá đơn nháp'
      subtitle={`Mã: ${invoiceData.invoice_code || id}`}
      onBack={() => navigate(`/sales/detail/${id}`)}
    >
      {invoice && (
        <InvoiceTabManager
          invoice={invoice}
          onUpdate={handleUpdateInvoice}
          onInvoiceCreated={handleInvoiceUpdated}
        />
      )}
    </Page>
  );
};

export default SalesEditPage;
