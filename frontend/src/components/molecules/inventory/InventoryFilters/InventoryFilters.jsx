import React from 'react';
import { HStack, FormControl, FormLabel } from '@chakra-ui/react';
import SearchInput from '../../../atoms/SearchInput';
import FilterSelect from '../../../atoms/FilterSelect';
import { ORDER_STATUS_OPTIONS, PAGE_SIZE_OPTIONS } from '../../../../constants/options';

const InventoryFilters = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  supplierFilter,
  onSupplierChange,
  pageSize,
  onPageSizeChange,
  suppliers = [],
  ...props
}) => {
  const supplierOptions = [
    { value: '', label: 'Tất cả nhà cung cấp' },
    ...suppliers.map(supplier => ({
      value: supplier.name,
      label: supplier.name
    }))
  ];

  return (
    <HStack spacing={4} wrap="wrap" {...props}>
      <FormControl minW="200px">
        <FormLabel fontSize="sm">Tìm kiếm</FormLabel>
        <SearchInput
          placeholder="Tìm theo mã, nhà cung cấp..."
          value={searchTerm}
          onChange={onSearchChange}
        />
      </FormControl>

      <FormControl minW="150px">
        <FormLabel fontSize="sm">Trạng thái</FormLabel>
        <FilterSelect
          options={ORDER_STATUS_OPTIONS}
          value={statusFilter}
          onChange={onStatusChange}
        />
      </FormControl>

      <FormControl minW="150px">
        <FormLabel fontSize="sm">Nhà cung cấp</FormLabel>
        <FilterSelect
          options={supplierOptions}
          value={supplierFilter}
          onChange={onSupplierChange}
        />
      </FormControl>

      <FormControl minW="100px">
        <FormLabel fontSize="sm">Hiển thị</FormLabel>
        <FilterSelect
          options={PAGE_SIZE_OPTIONS}
          value={pageSize}
          onChange={onPageSizeChange}
        />
      </FormControl>
    </HStack>
  );
};

export default InventoryFilters;
