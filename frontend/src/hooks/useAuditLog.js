import { useFetchApi } from './useFetchApi';

// Hook để lấy audit log của invoice
export const useAuditLog = (invoiceId, options = {}) => {
  const {
    enabled = true,
    ...fetchOptions
  } = options;

  return useFetchApi(
    ['audit-log', invoiceId],
    `/invoices/${invoiceId}/audit-logs`,
    {
      enabled: enabled && !!invoiceId,
      ...fetchOptions,
    }
  );
};

// Hook để lấy chi tiết audit log (bao gồm old_data và new_data)
export const useAuditLogDetail = (logId, options = {}) => {
  const {
    enabled = true,
    ...fetchOptions
  } = options;

  return useFetchApi(
    ['audit-log-detail', logId],
    `/audit-logs/id/${logId}`,
    {
      enabled: enabled && !!logId,
      ...fetchOptions,
    }
  );
};
