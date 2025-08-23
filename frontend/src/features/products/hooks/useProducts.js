import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchProtectedApi, API_ENDPOINTS } from "../../../shared/services/api";

// Query keys
export const productKeys = {
  all: ["products"],
  lists: () => [...productKeys.all, "list"],
  list: (filters) => [...productKeys.lists(), filters],
  details: () => [...productKeys.all, "detail"],
  detail: (id) => [...productKeys.details(), id],
};

// Get all products
export const useProducts = (filters = {}) => {
  return useQuery({
    queryKey: productKeys.list(filters),
    queryFn: () =>
      fetchProtectedApi.get(API_ENDPOINTS.PRODUCTS, { params: filters }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get product by ID
export const useProduct = (id) => {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => fetchProtectedApi.get(API_ENDPOINTS.PRODUCT_BY_ID(id)),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Create product
export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productData) =>
      fetchProtectedApi.post(API_ENDPOINTS.PRODUCTS, productData),
    onSuccess: () => {
      // Invalidate and refetch products list
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
    onError: (error) => {
      console.error("Error creating product:", error);
    },
  });
};

// Update product
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) =>
      fetchProtectedApi.put(API_ENDPOINTS.PRODUCT_BY_ID(id), data),
    onSuccess: (data, variables) => {
      // Update the product in cache
      queryClient.setQueryData(productKeys.detail(variables.id), data);
      // Invalidate products list
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
    onError: (error) => {
      console.error("Error updating product:", error);
    },
  });
};

// Delete product
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) =>
      fetchProtectedApi.delete(API_ENDPOINTS.PRODUCT_BY_ID(id)),
    onSuccess: (data, variables) => {
      // Remove product from cache
      queryClient.removeQueries({ queryKey: productKeys.detail(variables) });
      // Invalidate products list
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
    onError: (error) => {
      console.error("Error deleting product:", error);
    },
  });
};

// Search products
export const useSearchProducts = (searchTerm, filters = {}) => {
  return useQuery({
    queryKey: [...productKeys.lists(), "search", searchTerm, filters],
    queryFn: () =>
      fetchProtectedApi.get(API_ENDPOINTS.PRODUCTS, {
        params: { search: searchTerm, ...filters },
      }),
    enabled: !!searchTerm,
    staleTime: 2 * 60 * 1000, // 2 minutes for search results
  });
};

// Get products by category
export const useProductsByCategory = (categoryId) => {
  return useQuery({
    queryKey: [...productKeys.lists(), "category", categoryId],
    queryFn: () =>
      fetchProtectedApi.get(API_ENDPOINTS.PRODUCTS, {
        params: { category: categoryId },
      }),
    enabled: !!categoryId,
    staleTime: 5 * 60 * 1000,
  });
};

// Get low stock products
export const useLowStockProducts = (threshold = 10) => {
  return useQuery({
    queryKey: [...productKeys.lists(), "low-stock", threshold],
    queryFn: () =>
      fetchProtectedApi.get(API_ENDPOINTS.PRODUCTS, {
        params: { lowStock: threshold },
      }),
    staleTime: 2 * 60 * 1000, // 2 minutes for stock alerts
  });
};
