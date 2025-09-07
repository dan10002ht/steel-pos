import { useState, useCallback } from 'react';
import { useFetchApi } from '../useFetchApi';
import { useDebounce } from '../useDebounce';

export const useCustomerSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  // Debounce search term
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  
  // Search customers API call
  const {
    data: searchData,
    isLoading: isSearchLoading,
    error: searchError,
    refetch: refetchSearch
  } = useFetchApi(
    ['customers', 'search', debouncedSearchTerm],
    debouncedSearchTerm && debouncedSearchTerm.length >= 2 
      ? `/customers/search?q=${encodeURIComponent(debouncedSearchTerm)}&limit=10`
      : null,
    {
      enabled: Boolean(debouncedSearchTerm && debouncedSearchTerm.length >= 2),
      staleTime: 2 * 60 * 1000, // 2 minutes cache
    }
  );

  const searchCustomers = useCallback((term) => {
    setSearchTerm(term);
    setIsSearching(true);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setIsSearching(false);
  }, []);

  const selectCustomer = useCallback((customer) => {
    clearSearch();
    return customer;
  }, [clearSearch]);

  return {
    searchTerm,
    debouncedSearchTerm,
    isSearching,
    searchResults: searchData?.customers || [],
    isSearchLoading,
    searchError,
    searchCustomers,
    clearSearch,
    selectCustomer,
    refetchSearch
  };
};

