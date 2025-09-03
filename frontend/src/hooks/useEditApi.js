import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchApi } from '../shared/services/api';

// Hook để cập nhật data (PUT/PATCH requests)
export const useEditApi = (url, options = {}) => {
  const queryClient = useQueryClient();
  const {
    invalidateQueries = [],
    onSuccess,
    onError,
    method = 'PUT',
    ...mutationOptions
  } = options;

  return useMutation({
    mutationFn: async ({ id, data, url: customUrl }) => {
      const fullUrl = customUrl || (id ? `${url}/${id}` : url);
      const response = await fetchApi({ method, url: fullUrl, data });
      return response.data;
    },
    onSuccess: (data, variables, context) => {
      // Invalidate related queries
      invalidateQueries.forEach(queryKey => {
        queryClient.invalidateQueries({
          queryKey: Array.isArray(queryKey) ? queryKey : [queryKey],
        });
      });

      // Call custom onSuccess
      if (onSuccess) {
        onSuccess(data, variables, context);
      }
    },
    onError: (error, variables, context) => {
      if (onError) {
        onError(error, variables, context);
      }
    },
    ...mutationOptions,
  });
};
