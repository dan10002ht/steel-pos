import React from 'react';
import { HStack } from '@chakra-ui/react';
import SearchInput from '@/components/atoms/SearchInput';
import FilterDropdown from '@/components/atoms/FilterDropdown';

const CustomerFilters = ({
  searchTerm,
  onSearchChange,
  filterStatus,
  onFilterChange,
  debtFilter,
  onDebtFilterChange,
}) => {
  const statusOptions = [
    { value: 'all', label: 'Tất cả' },
    { value: 'active', label: 'Đang hoạt động' },
    { value: 'inactive', label: 'Không hoạt động' },
  ];

  const debtOptions = [
    { value: '', label: 'Tất cả' },
    { value: 'has_debt', label: 'Có nợ' },
    { value: 'no_debt', label: 'Không nợ' },
  ];

  return (
    <HStack spacing={4} wrap='wrap' w='100%'>
      <SearchInput
        placeholder='Tìm kiếm khách hàng...'
        value={searchTerm}
        onChange={onSearchChange}
      />
      <FilterDropdown
        label='Trạng thái'
        options={statusOptions}
        value={filterStatus}
        onChange={onFilterChange}
        placeholder='Tất cả'
      />
      <FilterDropdown
        label='Tồn nợ'
        options={debtOptions}
        value={debtFilter}
        onChange={onDebtFilterChange}
        placeholder='Tất cả'
      />
    </HStack>
  );
};

export default CustomerFilters;
