import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "../shared/services/api";

// Hook để upload files
export const useUploadApi = (url, options = {}) => {
  const queryClient = useQueryClient();
  const {
    invalidateQueries = [],
    onSuccess,
    onError,
    ...mutationOptions
  } = options;

  return useMutation({
    mutationFn: async (formData) => {
      const response = await fetchApi({
        method: "POST",
        url,
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
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
