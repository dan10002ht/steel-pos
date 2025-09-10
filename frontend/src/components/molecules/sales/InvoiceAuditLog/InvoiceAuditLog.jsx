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
  Button,
  IconButton,
  Divider,
  Avatar,
  Tooltip,
  useDisclosure,
} from "@chakra-ui/react";
import { Clock, User, Edit, Eye, ChevronDown, ChevronUp } from "lucide-react";
import { formatCurrency } from "@/utils";
import InvoiceComparisonModal from "./InvoiceComparisonModal";

const InvoiceAuditLog = ({ invoiceId, auditLogs = [] }) => {
  const [expandedLogs, setExpandedLogs] = useState({});
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedLog, setSelectedLog] = useState(null);

  const toggleLogExpansion = (logId) => {
    setExpandedLogs(prev => ({
      ...prev,
      [logId]: !prev[logId]
    }));
  };

  const handleCompareChanges = (log) => {
    setSelectedLog(log);
    onOpen();
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'created':
        return <Edit size={16} color="green" />;
      case 'updated':
        return <Edit size={16} color="blue" />;
      case 'deleted':
        return <Edit size={16} color="red" />;
      default:
        return <Edit size={16} color="gray" />;
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
      default:
        return 'gray';
    }
  };

  const getActionText = (action) => {
    switch (action) {
      case 'created':
        return 'Tạo mới';
      case 'updated':
        return 'Cập nhật';
      case 'deleted':
        return 'Xóa';
      default:
        return action;
    }
  };

  if (auditLogs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <HStack>
            <Clock size={20} />
            <Text fontWeight="bold">Lịch sử thay đổi</Text>
          </HStack>
        </CardHeader>
        <CardBody>
          <Text color="gray.500" textAlign="center" py={4}>
            Chưa có lịch sử thay đổi nào
          </Text>
        </CardBody>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <HStack>
            <Clock size={20} />
            <Text fontWeight="bold">Lịch sử thay đổi</Text>
            <Badge colorScheme="blue" variant="subtle">
              {auditLogs.length}
            </Badge>
          </HStack>
        </CardHeader>
        <CardBody>
          <VStack spacing={3} align="stretch">
            {auditLogs.map((log, index) => (
              <Box key={log.id || index}>
                <HStack justify="space-between" align="flex-start">
                  <HStack spacing={3} flex={1}>
                    <Avatar size="sm" name={log.user_name} />
                    <VStack align="flex-start" spacing={1} flex={1}>
                      <HStack>
                        {getActionIcon(log.action)}
                        <Text fontWeight="medium" fontSize="sm">
                          {log.user_name || 'Người dùng không xác định'}
                        </Text>
                        <Badge colorScheme={getActionColor(log.action)} size="sm">
                          {getActionText(log.action)}
                        </Badge>
                      </HStack>
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
                      <Tooltip label="So sánh thay đổi">
                        <IconButton
                          size="sm"
                          icon={<Eye size={14} />}
                          onClick={() => handleCompareChanges(log)}
                          colorScheme="blue"
                          variant="ghost"
                        />
                      </Tooltip>
                    )}
                    
                    {log.details && (
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

                {expandedLogs[log.id] && log.details && (
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

                {index < auditLogs.length - 1 && <Divider mt={3} />}
              </Box>
            ))}
          </VStack>
        </CardBody>
      </Card>

      <InvoiceComparisonModal
        isOpen={isOpen}
        onClose={onClose}
        auditLog={selectedLog}
      />
    </>
  );
};

export default InvoiceAuditLog;
