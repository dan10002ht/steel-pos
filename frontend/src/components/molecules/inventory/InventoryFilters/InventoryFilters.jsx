import React from 'react';
import { FormControl, FormLabel, Flex } from '@chakra-ui/react';
import SearchInput from '../../../atoms/SearchInput';
import FilterSelect from '../../../atoms/FilterSelect';
import { ORDER_STATUS_OPTIONS } from '../../../../constants/options';

const InventoryFilters = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  ...props
}) => {
  return (
    <Flex
      direction={{ base: 'column', md: 'row' }}
      gap={4}
      wrap='wrap'
      {...props}
    >
      <FormControl flex={1}>
        <FormLabel fontSize='sm'>Tìm kiếm</FormLabel>
        <SearchInput
          placeholder='Tìm theo mã, nhà cung cấp...'
          value={searchTerm}
          onChange={onSearchChange}
        />
      </FormControl>

      <FormControl flex={1}>
        <FormLabel fontSize='sm'>Trạng thái</FormLabel>
        <FilterSelect
          options={ORDER_STATUS_OPTIONS}
          value={statusFilter}
          onChange={onStatusChange}
        />
      </FormControl>
    </Flex>
  );
};

export default InventoryFilters;
