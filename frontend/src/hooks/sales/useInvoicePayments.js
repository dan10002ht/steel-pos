import { useFetchApi } from '../useFetchApi';
import { useCreateApi } from '../useCreateApi';
import { useUpdateApi } from '../useUpdateApi';
import { useDeleteApi } from '../useDeleteApi';

/**
 * Hook to manage invoice payments
 */
export const useInvoicePayments = (invoiceId) => {
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useFetchApi(
    ['invoice-payments', invoiceId],
    `/invoices/${invoiceId}/payments`,
    {
      enabled: !!invoiceId,
    }
  );
  const payments = data?.payments || [];

  return {
    payments,
    isLoading,
    error,
    refetch,
  };
};

/**
 * Hook to create invoice payment
 */
export const useCreateInvoicePayment = () => {
  const {
    mutate: createPayment,
    isLoading,
    error,
  } = useCreateApi('/invoice-payments', {
    onSuccess: () => {
      // Refetch payments after successful creation
      // This will be handled by the parent component
    },
  });

  const createPaymentForInvoice = async ({ url, data }) => {
    return new Promise((resolve, reject) => {
      createPayment({
        url,
        data,
        onSuccess: (response) => {
          resolve(response);
        },
        onError: (error) => {
          reject(error);
        },
      });
    });
  };

  return {
    createPayment: createPaymentForInvoice,
    isLoading,
    error,
  };
};

/**
 * Hook to update invoice payment
 */
export const useUpdateInvoicePayment = () => {
  const {
    mutate: updatePayment,
    isLoading,
    error,
  } = useUpdateApi('/invoice-payments', {
    onSuccess: () => {
      // Refetch payments after successful update
    },
  });

  return {
    updatePayment,
    isLoading,
    error,
  };
};

/**
 * Hook to delete invoice payment
 */
export const useDeleteInvoicePayment = () => {
  const {
    mutate: deletePayment,
    isLoading,
    error,
  } = useDeleteApi('/invoice-payments', {
    onSuccess: () => {
      // Refetch payments after successful deletion
    },
  });

  return {
    deletePayment,
    isLoading,
    error,
  };
};

export default useInvoicePayments;
