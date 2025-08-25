import { useState, useEffect, useCallback } from "react";
import productService from "../services/productService";

export const useProduct = (id) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch single product
  const fetchProduct = useCallback(async (productId) => {
    if (!productId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await productService.getProduct(productId);
      setProduct(response.data);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching product:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch when id changes
  useEffect(() => {
    if (id) {
      fetchProduct(id);
    }
  }, [id, fetchProduct]);

  // Create product
  const createProduct = useCallback(async (productData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await productService.createProduct(productData);
      setProduct(response.data);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update product
  const updateProduct = useCallback(async (productId, productData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await productService.updateProduct(
        productId,
        productData
      );
      setProduct(response.data);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete product
  const deleteProduct = useCallback(async (productId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await productService.deleteProduct(productId);
      setProduct(null);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update variant stock
  const updateVariantStock = useCallback(
    async (productId, variantId, newStock) => {
      setLoading(true);
      setError(null);

      try {
        const response = await productService.updateVariantStock(
          productId,
          variantId,
          newStock
        );
        setProduct(response.data);
        return response.data;
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Reset product state
  const resetProduct = useCallback(() => {
    setProduct(null);
    setError(null);
  }, []);

  return {
    // State
    product,
    loading,
    error,

    // Actions
    fetchProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    updateVariantStock,
    resetProduct,
  };
};
