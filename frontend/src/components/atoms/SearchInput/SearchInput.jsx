import React from "react";
import {
  Input,
  InputGroup,
  InputLeftElement,
} from "@chakra-ui/react";
import { Search } from "lucide-react";

const SearchInput = ({
  placeholder = "Tìm kiếm...",
  value,
  onChange,
  maxW = "400px",
  size = "md",
  iconSize = 16,
  ...props
}) => {
  return (
    <InputGroup maxW={{base: "100%", md: maxW}}>
      <InputLeftElement pointerEvents="none">
        <Search size={iconSize} />
      </InputLeftElement>
      <Input
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        size={size}
        {...props}
      />
    </InputGroup>
  );
};

export default SearchInput;
