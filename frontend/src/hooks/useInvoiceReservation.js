import { useInvoiceReservation as useInvoiceReservationContext } from '../contexts/InvoiceReservationContext';

/**
 * Convenience hook for using invoice reservation
 * Re-export từ context để dễ import
 */
export const useInvoiceReservation = () => {
  return useInvoiceReservationContext();
};

export default useInvoiceReservation;

