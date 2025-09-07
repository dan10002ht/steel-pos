import { useState, useCallback, useEffect } from 'react';
import { useDebounce } from '../../hooks/useDebounce';
import { useFetchApi } from '../../hooks/useFetchApi';

export const useProductVariantsSearch = ({
  searchTerm,
  limit = 20,
  enabled = true
}) => {
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  
  const [results, setResults] = useState([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentQuery, setCurrentQuery] = useState("");

  // Reset results when search term changes
  useEffect(() => {
    if (debouncedSearchTerm !== currentQuery) {
      setResults([]);
      setHasMore(true);
      setCurrentQuery(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, currentQuery]);

  // Use useFetchApi for search only (no default list)
  const {
    data: searchData,
    isLoading,
    error,
    refetch: refetchInitial
  } = useFetchApi(
    ['products', 'variants', 'search', debouncedSearchTerm],
    `/products/search/variants?q=${encodeURIComponent(debouncedSearchTerm)}&limit=${limit}`,
    {
      enabled: Boolean(enabled && debouncedSearchTerm && debouncedSearchTerm.length >= 1),
      staleTime: 2 * 60 * 1000, // 2 minutes cache
    }
  );

  // Process initial search results
  useEffect(() => {
    console.log("searchData", searchData);
    if (searchData?.products) {
      // Flatten variants from products into a single array
      const newResults = searchData.products?.flatMap(product => 
        product.variants?.map(variant => ({
          ...variant,
          product_id: product.id,
          product_name: product.name,
          product_unit: product.unit,
          product_notes: product.notes,
          unit_price: variant.price // Map price to unit_price for consistency
        })) || []
      ) || [];

      setResults(newResults);
      // Check if there are more results based on total vs current results
      setHasMore(newResults.length === limit && searchData.total > newResults.length);
    }
  }, [searchData, limit]);

  // Load more function
  const loadMore = useCallback(async () => {
    if (!isLoadingMore && hasMore && enabled && debouncedSearchTerm && debouncedSearchTerm.length >= 1) {
      setIsLoadingMore(true);
      try {
        const endpoint = `/api/products/search/variants?q=${encodeURIComponent(debouncedSearchTerm)}&limit=${limit}&offset=${results.length}`;
          
        const response = await fetch(endpoint);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.products) {
          // Flatten variants from products into a single array
          const newResults = data.products?.flatMap(product => 
            product.variants?.map(variant => ({
              ...variant,
              product_id: product.id,
              product_name: product.name,
              product_unit: product.unit,
              product_notes: product.notes,
              unit_price: variant.price
            })) || []
          ) || [];

          setResults(prev => [...prev, ...newResults]);
          // Check if there are more results based on total vs current results
          setHasMore(newResults.length === limit && data.total > (results.length + newResults.length));
        }
      } catch (err) {
        console.error('Load more error:', err);
      } finally {
        setIsLoadingMore(false);
      }
    }
  }, [enabled, debouncedSearchTerm, limit, hasMore, isLoadingMore, results.length]);

  // Refetch function
  const refetch = useCallback(() => {
    if (enabled && debouncedSearchTerm) {
      setResults([]);
      setHasMore(true);
      refetchInitial();
    }
  }, [enabled, refetchInitial, debouncedSearchTerm]);

  return {
    searchResults: results,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    loadMore,
    refetch,
    hasResults: results.length > 0,
    isEmpty: !isLoading && !error && debouncedSearchTerm.length >= 1 && results.length === 0
  };
};