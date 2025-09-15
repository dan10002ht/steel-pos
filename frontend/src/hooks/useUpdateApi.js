import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "../shared/services/api";

// Hook để cập nhật data (PUT requests)
export const useUpdateApi = (url, options = {}) => {
  const queryClient = useQueryClient();
  const {
    invalidateQueries = [],
    onSuccess,
    onError,
    ...mutationOptions
  } = options;

  return useMutation({
    mutationFn: async ({ id, data }) => {
      const fullUrl = id ? `${url}/${id}` : url;
      const response = await fetchApi({ method: "PUT", url: fullUrl, data });
      return response.data;
    },
    onSuccess: (data, variables, context) => {
      // Invalidate related queries
      invalidateQueries.forEach((queryKey) => {
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
