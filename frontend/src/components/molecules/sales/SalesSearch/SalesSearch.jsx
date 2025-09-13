import React from 'react';
import { Input, InputGroup, InputLeftElement } from '@chakra-ui/react';
import { Search } from 'lucide-react';

const SalesSearch = ({ searchTerm, onSearchChange, placeholder = 'Tìm kiếm theo mã hoá đơn, tên khách hàng, số điện thoại...' }) => {
  return (
    <InputGroup maxW='400px'>
      <InputLeftElement pointerEvents='none'>
        <Search size={20} />
      </InputLeftElement>
      <Input
        placeholder={placeholder}
        value={searchTerm}
        onChange={e => onSearchChange(e.target.value)}
      />
    </InputGroup>
  );
};

export default SalesSearch;
