import React from 'react';
import { HStack } from '@chakra-ui/react';
import SearchInput from '@/components/atoms/SearchInput';
import FilterDropdown from '@/components/atoms/FilterDropdown';

const CustomerFilters = ({
  searchTerm,
  onSearchChange,
  filterStatus,
  onFilterChange,
}) => {
  const statusOptions = [
    { value: 'all', label: 'Tất cả' },
    { value: 'active', label: 'Đang hoạt động' },
    { value: 'inactive', label: 'Không hoạt động' },
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
    </HStack>
  );
};

export default CustomerFilters;
