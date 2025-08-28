import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "../shared/services/api";

// Hook để fetch data (GET requests)
export const useFetchApi = (key, url, options = {}) => {
  const {
    enabled = true,
    refetchOnWindowFocus = false,
    refetchOnMount = true,
    staleTime = 5 * 60 * 1000, // 5 minutes
    cacheTime = 10 * 60 * 1000, // 10 minutes
    ...queryOptions
  } = options;

  return useQuery({
    queryKey: Array.isArray(key) ? key : [key],
    queryFn: async () => {
      const response = await fetchApi({ method: "GET", url });
      return response.data.data; // Return the actual data from the API response
    },
    enabled,
    refetchOnWindowFocus,
    refetchOnMount,
    staleTime,
    cacheTime,
    ...queryOptions,
  });
};
