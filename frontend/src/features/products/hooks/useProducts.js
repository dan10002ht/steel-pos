import { useState, useEffect, useCallback } from "react";
import productService from "../services/productService";

export const useProducts = (initialParams = {}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    sortBy: "createdAt",
    sortOrder: "desc",
    ...initialParams,
  });

  // Fetch products with current filters and pagination
  const fetchProducts = useCallback(
    async (params = {}) => {
      setLoading(true);
      setError(null);

      try {
        const response = await productService.getProducts({
          ...filters,
          ...params,
        });

        setProducts(response.data);
        setPagination(response.pagination);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    },
    [filters]
  );

  // Initial fetch
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Update filters and refetch
  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  }, []);

  // Change page
  const changePage = useCallback(
    (page) => {
      fetchProducts({ page });
    },
    [fetchProducts]
  );

  // Search products
  const searchProducts = useCallback(
    (searchTerm) => {
      updateFilters({ search: searchTerm });
    },
    [updateFilters]
  );

  // Filter by category
  const filterByCategory = useCallback(
    (category) => {
      updateFilters({ category });
    },
    [updateFilters]
  );

  // Sort products
  const sortProducts = useCallback(
    (sortBy, sortOrder = "desc") => {
      updateFilters({ sortBy, sortOrder });
    },
    [updateFilters]
  );

  // Refresh products
  const refreshProducts = useCallback(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Get products by category
  const getProductsByCategory = useCallback(async (category) => {
    setLoading(true);
    setError(null);

    try {
      const response = await productService.getProductsByCategory(category);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Search products (standalone)
  const searchProductsStandalone = useCallback(async (query) => {
    setLoading(true);
    setError(null);

    try {
      const response = await productService.searchProducts(query);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    // State
    products,
    loading,
    error,
    pagination,
    filters,

    // Actions
    fetchProducts,
    updateFilters,
    changePage,
    searchProducts,
    filterByCategory,
    sortProducts,
    refreshProducts,
    getProductsByCategory,
    searchProductsStandalone,
  };
};
