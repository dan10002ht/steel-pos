import React from 'react';
import { InputGroup, Input, InputRightElement, Icon } from '@chakra-ui/react';
import { Search } from 'lucide-react';

const SearchInput = ({ placeholder = "Tìm kiếm...", value, onChange, ...props }) => {
  return (
    <InputGroup {...props}>
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <InputRightElement>
        <Icon as={Search} color="gray.400" />
      </InputRightElement>
    </InputGroup>
  );
};

export default SearchInput;