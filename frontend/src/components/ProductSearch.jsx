import React, { useState, useRef } from "react";
import {
  Box,
  Input,
  Spinner,
  Text,
  VStack,
  HStack,
  Badge,
  Button,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  InputGroup,
  InputLeftElement,
} from "@chakra-ui/react";
import { Search, Plus, ChevronDown } from "lucide-react";
import { useDebounce } from "../hooks/useDebounce";
import { useFetchApi } from "../hooks/useFetchApi";

const ProductSearch = ({
  onSelect,
  onCreateNew,
  placeholder = "Tìm kiếm sản phẩm...",
  searchType = "basic",
  limit = 10,
  isDisabled = false,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const inputRef = useRef();

  // Determine API endpoint based on search type
  const getSearchEndpoint = () => {
    const basePath = '/products/search'
    switch (searchType) {
      case "import-order":
        return `${basePath}/import-order?q=${debouncedSearchTerm}&limit=${limit}`;
      case "variants":
        return `${basePath}/variants?q=${debouncedSearchTerm}&limit=${limit}`;
      case "basic":
      default:
        return `${basePath}?q=${debouncedSearchTerm}&limit=${limit}`;
    }
  };

  // Use useFetchApi for search
  const {
    data: searchData,
    isLoading,
    error,
  } = useFetchApi(
    ["products", "search", searchType, debouncedSearchTerm],
    getSearchEndpoint(),
    {
      enabled: debouncedSearchTerm.length >= 1 && isOpen,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  const searchResults = searchData?.products || [];

  // Handle product selection
  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    onSelect(product);
    setIsOpen(false);
    setSearchTerm("");
  };

  // Handle create new product
  const handleCreateNew = () => {
    if (onCreateNew) {
      onCreateNew();
    }
    setIsOpen(false);
    setSearchTerm("");
  };

  // Handle input change in popover
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
  };

  // Handle popover open/close
  const handlePopoverOpen = () => {
    setIsOpen(true);
  };

  const handlePopoverClose = () => {
    setIsOpen(false);
    setSearchTerm("");
  };



  return (
    <Popover
      isOpen={isOpen}
      onOpen={handlePopoverOpen}
      onClose={handlePopoverClose}
      placement="bottom-start"
      closeOnBlur={false}
    >
      <PopoverTrigger>
        <Box position="relative" width="100%">
          <Input
            ref={inputRef}
            placeholder={placeholder}
            value={selectedProduct ? selectedProduct.name : ""}
            isReadOnly
            size="sm"
            pr="8"
            isDisabled={isDisabled}
            cursor="pointer"
            _hover={{ borderColor: "blue.300" }}
            _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px var(--chakra-colors-blue-500)" }}
          />
          
          {/* Chevron Icon */}
          <Box
            position="absolute"
            right="3"
            top="50%"
            transform="translateY(-50%)"
            color="gray.400"
            pointerEvents="none"
          >
            <ChevronDown size={16} />
          </Box>
        </Box>
      </PopoverTrigger>

      <PopoverContent width="100%" maxWidth="500px">
        <PopoverBody p={0}>
          {/* Search Input in Popover */}
          <Box p={3} borderBottom="1px" borderColor="gray.200">
            <InputGroup size="sm">
              <InputLeftElement pointerEvents="none">
                {isLoading ? <Spinner size="sm" /> : <Search size={16} />}
              </InputLeftElement>
              <Input
                placeholder="Tìm kiếm sản phẩm..."
                value={searchTerm}
                onChange={handleSearchChange}
                autoFocus
                pr="8"
              />
            </InputGroup>
          </Box>

          {/* Search Results */}
          <Box maxH="300px" overflowY="auto">
            {error && (
              <Box p={3} color="red.500" fontSize="sm">
                Lỗi tìm kiếm: {error.message}
              </Box>
            )}

            {isLoading && (
              <Box p={3} textAlign="center">
                <Spinner size="sm" />
                <Text fontSize="sm" color="gray.500" mt={2}>
                  Đang tìm kiếm...
                </Text>
              </Box>
            )}

            {!isLoading && !error && searchTerm.length >= 1 && searchResults.length === 0 && (
              <Box p={3} textAlign="center">
                <Text fontSize="sm" color="gray.500">
                  Không tìm thấy sản phẩm
                </Text>
                {onCreateNew && (
                  <Button
                    size="sm"
                    variant="ghost"
                    colorScheme="blue"
                    leftIcon={<Plus size={14} />}
                    onClick={handleCreateNew}
                    mt={2}
                  >
                    Tạo sản phẩm mới
                  </Button>
                )}
              </Box>
            )}

            {!isLoading && !error && searchResults.length > 0 && (
              <>
                {searchResults.map((product) => (
                  <Box
                    key={product.id}
                    p={3}
                    cursor="pointer"
                    _hover={{ bg: "gray.50" }}
                    onClick={() => handleProductSelect(product)}
                    borderBottom="1px"
                    borderColor="gray.100"
                  >
                    <VStack align="start" spacing={1}>
                      <HStack justify="space-between" width="100%">
                        <Text fontWeight="medium" fontSize="sm">
                          {product.name}
                        </Text>
                        <Badge size="sm" colorScheme="blue">
                          {product.unit}
                        </Badge>
                      </HStack>
                      
                      {product.notes && (
                        <Text fontSize="xs" color="gray.600" noOfLines={1}>
                          {product.notes}
                        </Text>
                      )}

                      {product.variants && product.variants.length > 0 && (
                        <HStack spacing={1}>
                          <Text fontSize="xs" color="gray.500">
                            Variants:
                          </Text>
                          {product.variants.slice(0, 3).map((variant) => (
                            <Badge
                              key={variant.id}
                              size="xs"
                              variant="outline"
                            >
                              {variant.name}
                            </Badge>
                          ))}
                          {product.variants.length > 3 && (
                            <Text fontSize="xs" color="gray.500">
                              +{product.variants.length - 3} more
                            </Text>
                          )}
                        </HStack>
                      )}
                    </VStack>
                  </Box>
                ))}

                {onCreateNew && (
                  <Box p={2} borderTop="1px solid #e2e8f0">
                    <Button
                      size="sm"
                      variant="ghost"
                      colorScheme="blue"
                      leftIcon={<Plus size={14} />}
                      onClick={handleCreateNew}
                      width="100%"
                      justifyContent="flex-start"
                    >
                      Tạo sản phẩm mới
                    </Button>
                  </Box>
                )}
              </>
            )}

            {!isLoading && !error && searchTerm.length === 0 && (
              <Box p={3} textAlign="center">
                <Text fontSize="sm" color="gray.500">
                  Nhập từ khóa để tìm kiếm sản phẩm
                </Text>
              </Box>
            )}
          </Box>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};

export default ProductSearch;
