import { useFetchApi } from './useFetchApi';

/**
 * Hook để lấy audit logs cho một entity cụ thể
 * @param {string} entityType - Loại entity (invoice, customer, product, etc.)
 * @param {number} entityId - ID của entity
 * @param {object} options - Các options cho useFetchApi
 */
export const useEntityAuditLogs = (entityType, entityId, options = {}) => {
  const {
    enabled = true,
    ...fetchOptions
  } = options;

  return useFetchApi(
    ['audit-logs', entityType, entityId],
    `/audit-logs/entity/${entityType}/${entityId}`,
    {
      enabled: enabled && !!entityType && !!entityId,
      ...fetchOptions,
    }
  );
};

/**
 * Hook để lấy audit logs với filter
 * @param {object} filters - Filters cho audit logs
 * @param {object} options - Các options cho useFetchApi
 */
export const useAuditLogsWithFilter = (filters = {}, options = {}) => {
  const {
    enabled = true,
    ...fetchOptions
  } = options;

  // Build query string from filters
  const queryParams = new URLSearchParams();
  
  if (filters.entityType) queryParams.append('entity_type', filters.entityType);
  if (filters.entityId) queryParams.append('entity_id', filters.entityId);
  if (filters.action) queryParams.append('action', filters.action);
  if (filters.userId) queryParams.append('user_id', filters.userId);
  if (filters.dateFrom) queryParams.append('date_from', filters.dateFrom);
  if (filters.dateTo) queryParams.append('date_to', filters.dateTo);
  if (filters.page) queryParams.append('page', filters.page);
  if (filters.limit) queryParams.append('limit', filters.limit);

  const queryString = queryParams.toString();
  const url = queryString ? `/audit-logs?${queryString}` : '/audit-logs';

  return useFetchApi(
    ['audit-logs', 'filtered', filters],
    url,
    {
      enabled,
      ...fetchOptions,
    }
  );
};

/**
 * Hook để lấy audit logs gần đây (dashboard)
 * @param {number} limit - Số lượng logs muốn lấy
 * @param {object} options - Các options cho useFetchApi
 */
export const useRecentAuditLogs = (limit = 10, options = {}) => {
  const {
    enabled = true,
    ...fetchOptions
  } = options;

  return useFetchApi(
    ['audit-logs', 'recent', limit],
    `/audit-logs/recent?limit=${limit}`,
    {
      enabled,
      ...fetchOptions,
    }
  );
};

/**
 * Hook để lấy audit logs của user hiện tại
 * @param {number} userId - ID của user
 * @param {object} options - Các options cho useFetchApi
 */
export const useUserAuditLogs = (userId, options = {}) => {
  const {
    enabled = true,
    ...fetchOptions
  } = options;

  return useFetchApi(
    ['audit-logs', 'user', userId],
    `/audit-logs/user/${userId}`,
    {
      enabled: enabled && !!userId,
      ...fetchOptions,
    }
  );
};

/**
 * Hook để lấy audit log detail
 * @param {number} logId - ID của audit log
 * @param {object} options - Các options cho useFetchApi
 */
export const useAuditLogDetail = (logId, options = {}) => {
  const {
    enabled = true,
    ...fetchOptions
  } = options;

  return useFetchApi(
    ['audit-log-detail', logId],
    `/audit-logs/${logId}`,
    {
      enabled: enabled && !!logId,
      ...fetchOptions,
    }
  );
};

// Re-export existing hooks for backward compatibility
export { useAuditLog, useAuditLogDetail as useInvoiceAuditLogDetail } from './useAuditLog';












