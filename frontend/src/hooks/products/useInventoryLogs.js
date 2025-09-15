import { useFetchApi } from '../useFetchApi';

/**
 * Hook to fetch inventory logs for a product or variant
 * @param {number} productId - Product ID
 * @param {number} variantId - Optional variant ID to filter by specific variant
 * @param {Object} options - Additional options for the API call
 */
export const useInventoryLogs = (productId, variantId = null, options = {}) => {
  const { page, limit, ...otherOptions } = options;
  const queryKey = ['inventory-logs', productId, variantId, page, limit];
  let endpoint = `/products/${productId}/inventory-logs`;
  
  const params = new URLSearchParams();
  if (variantId) {
    params.append('variant_id', variantId);
  }
  if (page) {
    params.append('page', page);
  }
  if (limit) {
    params.append('limit', limit);
  }
  
  if (params.toString()) {
    endpoint += `?${params.toString()}`;
  }

  return useFetchApi(queryKey, endpoint, {
    enabled: !!productId,
    ...otherOptions,
  });
};

export default useInventoryLogs;



