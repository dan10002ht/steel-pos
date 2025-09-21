import React, { useMemo } from "react";
import {
  Box,
  VStack,
  Text,
} from "@chakra-ui/react";

const Timeline = ({ 
  items = [], 
  groupBy = "date",
  renderItem,
  emptyMessage = "Không có dữ liệu",
  showVerticalLine = true
}) => {
  // Group items by specified field
  const groupedItems = useMemo(() => {
    const groups = {};
    items.forEach(item => {
      let groupKey;
      
      if (groupBy === "date") {
        groupKey = new Date(item.created_at || item.date).toLocaleDateString('vi-VN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      } else if (typeof groupBy === "function") {
        groupKey = groupBy(item);
      } else {
        groupKey = item[groupBy] || "Khác";
      }
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(item);
    });
    return groups;
  }, [items, groupBy]);

  if (items.length === 0) {
    return (
      <Text color="gray.500" textAlign="center" py={4}>
        {emptyMessage}
      </Text>
    );
  }

  return (
    <VStack spacing={6} align="stretch">
      {Object.entries(groupedItems).map(([groupKey, groupItems]) => (
        <Box key={groupKey}>
          {/* Group Header */}
          <Text 
            fontSize="sm" 
            fontWeight="semibold" 
            color="gray.700" 
            mb={3}
            textTransform="capitalize"
          >
            {groupKey}
          </Text>
          
          {/* Timeline */}
          <Box position="relative">
            {/* Vertical Line */}
            {showVerticalLine && (
              <Box
                position="absolute"
                left="12px"
                top="0"
                bottom="0"
                width="2px"
                bg="gray.200"
                borderRadius="1px"
              />
            )}
            
            {/* Items for this group */}
            <VStack spacing={4} align="stretch">
              {groupItems.map((item, index) => (
                <Box key={item.id || index} position="relative">
                  {renderItem ? renderItem(item, index) : (
                    <Box ml={showVerticalLine ? 8 : 0}>
                      <Text fontSize="sm" color="gray.800">
                        {item.display_text || item.title || item.name || "Item"}
                      </Text>
                    </Box>
                  )}
                </Box>
              ))}
            </VStack>
          </Box>
        </Box>
      ))}
    </VStack>
  );
};

export default Timeline;
