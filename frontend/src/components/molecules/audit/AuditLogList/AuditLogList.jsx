import React, { useState } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Card,
  CardBody,
  CardHeader,
  Badge,
  IconButton,
  Divider,
  Avatar,
  Tooltip,
  useDisclosure,
  Button,
  Flex,
} from "@chakra-ui/react";
import { 
  Clock, 
  Eye, 
  ChevronDown, 
  ChevronUp, 
  Filter,
  RefreshCw
} from "lucide-react";
import { generateLog, generateDetailedLog } from "@/utils/auditLogFormatter";
import AuditLogText from "@/components/atoms/AuditLogText/AuditLogText";

const AuditLogList = ({ 
  auditLogs = [], 
  title = "Lịch sử hoạt động",
  showDetailedLog = false,
  showFilters = false,
  onRefresh,
  isLoading = false,
  maxHeight = "400px",
  ...props 
}) => {
  const [expandedLogs, setExpandedLogs] = useState({});
  const [showAll, setShowAll] = useState(false);

  const toggleLogExpansion = (logId) => {
    setExpandedLogs(prev => ({
      ...prev,
      [logId]: !prev[logId]
    }));
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'created':
        return <Box w={2} h={2} bg="green.500" borderRadius="full" />;
      case 'updated':
        return <Box w={2} h={2} bg="blue.500" borderRadius="full" />;
      case 'deleted':
        return <Box w={2} h={2} bg="red.500" borderRadius="full" />;
      case 'cancelled':
        return <Box w={2} h={2} bg="orange.500" borderRadius="full" />;
      case 'payment_created':
        return <Box w={2} h={2} bg="purple.500" borderRadius="full" />;
      default:
        return <Box w={2} h={2} bg="gray.500" borderRadius="full" />;
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
      case 'cancelled':
        return 'orange';
      case 'payment_created':
        return 'purple';
      default:
        return 'gray';
    }
  };

  // Limit logs if not showing all
  const displayLogs = showAll ? auditLogs : auditLogs.slice(0, 5);

  if (auditLogs.length === 0) {
    return (
      <Card {...props}>
        <CardHeader>
          <HStack justify="space-between">
            <HStack>
              <Clock size={20} />
              <Text fontWeight="bold">{title}</Text>
            </HStack>
            {onRefresh && (
              <IconButton
                size="sm"
                icon={<RefreshCw size={16} />}
                onClick={onRefresh}
                isLoading={isLoading}
                variant="ghost"
              />
            )}
          </HStack>
        </CardHeader>
        <CardBody>
          <Text color="gray.500" textAlign="center" py={4}>
            Chưa có hoạt động nào
          </Text>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card {...props}>
      <CardHeader>
        <Flex justify="space-between" align="center">
          <HStack>
            <Clock size={20} />
            <Text fontWeight="bold">{title}</Text>
            <Badge colorScheme="blue" variant="subtle">
              {auditLogs.length}
            </Badge>
          </HStack>
          <HStack spacing={2}>
            {onRefresh && (
              <IconButton
                size="sm"
                icon={<RefreshCw size={16} />}
                onClick={onRefresh}
                isLoading={isLoading}
                variant="ghost"
              />
            )}
            {showFilters && (
              <IconButton
                size="sm"
                icon={<Filter size={16} />}
                variant="ghost"
              />
            )}
          </HStack>
        </Flex>
      </CardHeader>
      <CardBody>
        <Box maxHeight={maxHeight} overflowY="auto">
          <VStack spacing={3} align="stretch">
            {displayLogs.map((log, index) => (
              <Box key={log.id || index}>
                <HStack justify="space-between" align="flex-start">
                  <HStack spacing={3} flex={1}>
                    <Avatar size="sm" name={log.user_name || 'Hệ thống'} />
                    <VStack align="flex-start" spacing={1} flex={1}>
                      <HStack spacing={2}>
                        {getActionIcon(log.action)}
                        <Badge colorScheme={getActionColor(log.action)} size="sm">
                          {log.action}
                        </Badge>
                      </HStack>
                      <AuditLogText 
                        auditLog={log} 
                        variant={showDetailedLog ? "detailed" : "simple"}
                        fontSize="sm"
                        fontWeight="medium"
                        color="gray.700"
                      />
                      <Text fontSize="xs" color="gray.600">
                        {new Date(log.created_at).toLocaleString('vi-VN')}
                      </Text>
                      {log.changes_summary && (
                        <Text fontSize="xs" color="gray.500" noOfLines={2}>
                          {log.changes_summary}
                        </Text>
                      )}
                    </VStack>
                  </HStack>
                  
                  <HStack spacing={1}>
                    {log.old_data && log.new_data && (
                      <Tooltip label="Xem chi tiết thay đổi">
                        <IconButton
                          size="sm"
                          icon={<Eye size={14} />}
                          variant="ghost"
                        />
                      </Tooltip>
                    )}
                    
                    {log.changes_summary && (
                      <Tooltip label={expandedLogs[log.id] ? "Thu gọn" : "Xem chi tiết"}>
                        <IconButton
                          size="sm"
                          icon={expandedLogs[log.id] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          onClick={() => toggleLogExpansion(log.id)}
                          variant="ghost"
                        />
                      </Tooltip>
                    )}
                  </HStack>
                </HStack>

                {expandedLogs[log.id] && log.changes_summary && (
                  <Box mt={3} p={3} bg="gray.50" borderRadius="md">
                    <Text fontSize="xs" color="gray.600">
                      {log.changes_summary}
                    </Text>
                  </Box>
                )}

                {index < displayLogs.length - 1 && <Divider mt={3} />}
              </Box>
            ))}
          </VStack>
        </Box>

        {auditLogs.length > 5 && (
          <Box mt={4} textAlign="center">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? "Thu gọn" : `Xem thêm ${auditLogs.length - 5} hoạt động`}
            </Button>
          </Box>
        )}
      </CardBody>
    </Card>
  );
};

export default AuditLogList;





