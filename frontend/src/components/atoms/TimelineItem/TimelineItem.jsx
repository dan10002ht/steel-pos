import React from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Button,
  Tooltip,
  Flex,
} from "@chakra-ui/react";
import { 
  CheckCircle,
  AlertCircle,
  XCircle,
  CreditCard,
  FileText,
  DollarSign,
  Edit,
  Eye,
  ChevronDown,
  ChevronUp
} from "lucide-react";

const TimelineItem = ({ 
  log, 
  isExpanded = false,
  onCompareChanges,
  onToggleExpansion,
  showDetailedLog = false
}) => {
  const getActionIcon = (action, logType) => {
    switch (action) {
      case 'created':
        if (logType === 'invoice_created') return <FileText size={16} />;
        return <CheckCircle size={16} />;
      case 'updated':
        return <Edit size={16} />;
      case 'deleted':
        return <XCircle size={16} />;
      case 'payment_created':
        return <CreditCard size={16} />;
      case 'payment_updated':
        return <DollarSign size={16} />;
      default:
        return <AlertCircle size={16} />;
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'created':
        return 'green';
      case 'updated':
        return 'blue';
      case 'deleted':
        return 'red';
      case 'payment_created':
        return 'purple';
      case 'payment_updated':
        return 'orange';
      default:
        return 'gray';
    }
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  return (
    <Box position="relative">
      {/* Timeline Dot */}
      <Box
        position="absolute"
        left="6px"
        top="6px"
        width="12px"
        height="12px"
        borderRadius="50%"
        bg={`${getActionColor(log.action)}.500`}
        border="2px solid"
        borderColor="white"
        boxShadow="0 0 0 2px"
        shadowColor={`${getActionColor(log.action)}.200`}
        zIndex={1}
      />
      
      {/* Log Content */}
      <Box ml={8}>
        <Flex justify="space-between" align="flex-start">
          <Box flex={1}>
            {/* Display Text */}
            <Badge 
                colorScheme={getActionColor(log.action)} 
                size="sm"
                variant="subtle"
              >
                {log.action}
              </Badge>
            <Text fontSize="sm" color="gray.800" mb={1}>
              {log.display_text || log.changes_summary || `${log.action} action`}
            </Text>
            
            {/* Action Badge */}
            <HStack spacing={2} mb={2}>
              {log.log_type && log.log_type !== `invoice_${log.action}` && (
                <Badge colorScheme="gray" size="sm" variant="outline">
                  {log.log_type}
                </Badge>
              )}
            </HStack>
          </Box>
          
          <Text fontSize="xs" color="gray.500" ml={4} whiteSpace="nowrap">
            {formatTime(log.created_at)}
          </Text>
        </Flex>
        
        <HStack spacing={1} mt={2}>
          {/* {log.old_data && log.new_data && onCompareChanges && (
            <Tooltip label="So sánh thay đổi">
              <Button
                size="xs"
                leftIcon={<Eye size={12} />}
                onClick={() => onCompareChanges(log)}
                colorScheme="blue"
                variant="ghost"
              >
                Xem chi tiết
              </Button>
            </Tooltip>
          )} */}
          
          {log.details && onToggleExpansion && (
            <Tooltip label={isExpanded ? "Thu gọn" : "Xem chi tiết"}>
              <Button
                size="xs"
                leftIcon={isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                onClick={() => onToggleExpansion(log.id)}
                variant="ghost"
              >
                {isExpanded ? "Thu gọn" : "Chi tiết"}
              </Button>
            </Tooltip>
          )}
        </HStack>
        
        {/* Expanded Details */}
        {isExpanded && log.details && (
          <Box mt={3} p={3} bg="gray.50" borderRadius="md">
            <VStack align="stretch" spacing={2}>
              {log.details.map((detail, detailIndex) => (
                <HStack key={detailIndex} justify="space-between">
                  <Text fontSize="xs" fontWeight="medium">
                    {detail.field}:
                  </Text>
                  <HStack spacing={2}>
                    {detail.old_value && (
                      <Text fontSize="xs" color="red.600" textDecoration="line-through">
                        {detail.old_value}
                      </Text>
                    )}
                    {detail.new_value && (
                      <Text fontSize="xs" color="green.600" fontWeight="medium">
                        {detail.new_value}
                      </Text>
                    )}
                  </HStack>
                </HStack>
              ))}
            </VStack>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default TimelineItem;
