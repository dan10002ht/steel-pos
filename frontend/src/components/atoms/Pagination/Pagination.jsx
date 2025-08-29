import React from "react";
import {
  HStack,
  Button,
  Text,
  Select,
  Flex,
  Spacer,
  Box,
} from "@chakra-ui/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Pagination = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  showPageSizeSelector = true,
  showTotal = true,
}) => {
  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show pages around current page
      let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
      let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      
      // Adjust if we're near the end
      if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();



  return (
    <Flex align="center" gap={4} flexWrap="wrap">
      {/* Left side - Page navigation */}
      <HStack spacing={2}>
        {/* Previous button */}
        <Button
          size="sm"
          variant="outline"
          onClick={() => onPageChange(currentPage - 1)}
          isDisabled={currentPage === 1}
          px={3}
        >
          <ChevronLeft size={16} />
        </Button>

        {/* Page number buttons */}
        {pageNumbers.map((page) => (
          <Button
            key={page}
            size="sm"
            variant={currentPage === page ? "solid" : "outline"}
            colorScheme={currentPage === page ? "blue" : "gray"}
            onClick={() => onPageChange(page)}
            minW="40px"
            h="40px"
            px={3}
          >
            {page}
          </Button>
        ))}

        {/* Next button */}
        <Button
          size="sm"
          variant="outline"
          onClick={() => onPageChange(currentPage + 1)}
          isDisabled={currentPage === totalPages}
          px={3}
        >
          <ChevronRight size={16} />
        </Button>
      </HStack>

      <Spacer />

      {/* Right side - Total and page size */}
      <HStack spacing={4}>
        {/* Total items */}
        {showTotal && (
          <Text fontSize="sm" color="gray.600">
            Tổng số: {totalItems.toLocaleString()}
          </Text>
        )}

        {/* Page size selector */}
        {showPageSizeSelector && (
          <HStack spacing={2}>
            <Text fontSize="sm" color="gray.600">
              Hiển thị:
            </Text>
            <Select
              size="sm"
              value={pageSize}
              onChange={(e) => onPageSizeChange(parseInt(e.target.value))}
              w="80px"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </Select>
            <Text fontSize="sm" color="gray.600">
              / trang
            </Text>
          </HStack>
        )}
      </HStack>
    </Flex>
  );
};

export default Pagination;
