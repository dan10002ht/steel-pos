import {
  useCreateApi,
  useEditApi,
  useDeleteApi,
  useFetchApi,
} from "../../../hooks";

// Hook để tạo product mới
export const useCreateProduct = (options = {}) => {
  return useCreateApi("/products", {
    invalidateQueries: [["products"]],
    ...options,
  });
};

// Hook để cập nhật product
export const useEditProduct = (options = {}) => {
  const defaultInvalidateQueries = [["products"], ["product"]];

  return useEditApi("/products", {
    invalidateQueries: options.invalidateQueries || defaultInvalidateQueries,
    ...options,
  });
};

// Hook để xóa product
export const useDeleteProduct = (options = {}) => {
  return useDeleteApi("/products", {
    invalidateQueries: [["products"]],
    ...options,
  });
};

// Hook để lấy danh sách products
export const useProducts = (filters = {}, options = {}) => {
  const queryParams = new URLSearchParams();

  if (filters.search) queryParams.append("search", filters.search);
  if (filters.page) queryParams.append("page", filters.page);
  if (filters.limit) queryParams.append("limit", filters.limit);

  const url = `/products${
    queryParams.toString() ? `?${queryParams.toString()}` : ""
  }`;

  return useFetchApi(["products", filters], url, options);
};

// Hook để lấy chi tiết product
export const useProduct = (id, options = {}) => {
  return useFetchApi(["product", id], `/products/${id}`, {
    enabled: !!id,
    ...options,
  });
};
