import React from 'react';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Badge,
  Text,
  VStack,
  HStack,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Box,
  Icon,
  Button,
} from '@chakra-ui/react';
import { ArrowUp, ArrowDown, Package, ShoppingCart, RotateCcw, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDateTime, formatNumber } from '../../../../utils/formatters';

const InventoryLogTable = ({ 
  logs, 
  isLoading, 
  error
}) => {
  const navigate = useNavigate();
  const getMovementIcon = (logType) => {
    switch (logType) {
      case 'sale':
        return ShoppingCart;
      case 'import':
        return ArrowUp;
      case 'adjustment':
        return RotateCcw;
      case 'return':
        return ArrowDown;
      case 'cancellation':
        return RotateCcw;
      default:
        return Package;
    }
  };

  const getMovementColor = (logType) => {
    switch (logType) {
      case 'sale':
        return 'red';
      case 'import':
        return 'green';
      case 'adjustment':
        return 'blue';
      case 'return':
        return 'orange';
      case 'cancellation':
        return 'purple';
      default:
        return 'gray';
    }
  };

  const getMovementLabel = (logType) => {
    switch (logType) {
      case 'sale':
        return 'Bán hàng';
      case 'import':
        return 'Nhập kho';
      case 'adjustment':
        return 'Điều chỉnh';
      case 'return':
        return 'Trả hàng';
      case 'cancellation':
        return 'Hủy hóa đơn';
      default:
        return logType;
    }
  };

  const formatQuantityChange = (quantityChange) => {
    const isPositive = quantityChange > 0;
    const prefix = isPositive ? '+' : '';
    return `${prefix}${formatNumber(quantityChange)}`;
  };

  const handleReferenceClick = (referenceType, referenceId) => {
    switch (referenceType) {
      case 'invoice':
        navigate(`/sales/invoices/${referenceId}`);
        break;
      case 'import_order':
        navigate(`/inventory/import-orders/${referenceId}`);
        break;
      case 'adjustment':
        // Navigate to adjustment detail if exists
        navigate(`/inventory/adjustments/${referenceId}`);
        break;
      default:
        // For unknown reference types, don't navigate
        break;
    }
  };

  const getReferenceLabel = (referenceType) => {
    switch (referenceType) {
      case 'invoice':
        return 'Hóa đơn';
      case 'import_order':
        return 'Đơn nhập';
      case 'adjustment':
        return 'Điều chỉnh';
      default:
        return referenceType;
    }
  };

  if (isLoading) {
    return (
      <VStack spacing={4} align="center" justify="center" minH="200px">
        <Spinner size="lg" color="blue.500" />
        <Text color="gray.500">Đang tải lịch sử tồn kho...</Text>
      </VStack>
    );
  }

  if (error) {
    return (
      <Alert status="error" borderRadius="md">
        <AlertIcon />
        <Box>
          <AlertTitle>Lỗi!</AlertTitle>
          <AlertDescription>
            {error.message || "Không thể tải lịch sử tồn kho. Vui lòng thử lại."}
          </AlertDescription>
        </Box>
      </Alert>
    );
  }

  if (!logs || logs.length === 0) {
    return (
      <VStack spacing={4} align="center" justify="center" minH="200px" py={8}>
        <Box
          p={4}
          borderRadius="full"
          bg="gray.50"
          color="gray.400"
        >
          <Package size={32} />
        </Box>
        <VStack spacing={2} textAlign="center">
          <Text fontSize="lg" fontWeight="semibold" color="gray.700">
            Chưa có lịch sử tồn kho
          </Text>
          <Text fontSize="md" color="gray.500">
            Sản phẩm này chưa có hoạt động tồn kho nào.
          </Text>
        </VStack>
      </VStack>
    );
  }

  return (
    <TableContainer>
      <Table variant="simple" size="sm">
        <Thead>
          <Tr>
            <Th>Loại</Th>
            <Th>Thay đổi</Th>
            <Th>Giá trị trước</Th>
            <Th>Giá trị sau</Th>
            <Th>Tham chiếu</Th>
            <Th>Ghi chú</Th>
            <Th>Thời gian</Th>
          </Tr>
        </Thead>
        <Tbody>
          {logs.map((log) => (
            <Tr key={log.id}>
              <Td>
                <HStack spacing={2}>
                  <Icon 
                    as={getMovementIcon(log.log_type)} 
                    color={`${getMovementColor(log.log_type)}.500`}
                    boxSize={4}
                  />
                  <Badge 
                    colorScheme={getMovementColor(log.log_type)}
                    fontSize="xs"
                    variant="subtle"
                  >
                    {getMovementLabel(log.log_type)}
                  </Badge>
                </HStack>
              </Td>
              <Td>
                <Text 
                  fontWeight="medium"
                  color={log.quantity_change > 0 ? "green.600" : "red.600"}
                >
                  {formatQuantityChange(log.quantity_change)}
                </Text>
              </Td>
              <Td>
                <Text color="gray.600">
                  {formatNumber(log.previous_value)}
                </Text>
              </Td>
              <Td>
                <Text fontWeight="medium">
                  {formatNumber(log.new_value)}
                </Text>
              </Td>
              <Td>
                <Button
                  variant="ghost"
                  size="sm"
                  p={0}
                  h="auto"
                  minW="auto"
                  border="none"
                  onClick={() => handleReferenceClick(log.reference_entity_type, log.reference_entity_id)}
                  _hover={{ bg: 'gray.50', border: "none" }}
                  isDisabled={!['invoice', 'import_order', 'adjustment'].includes(log.reference_entity_type)}
                >
                  <VStack align="flex-start" spacing={0}>
                    <HStack spacing={1}>
                      <Text fontSize="xs" color="gray.500">
                        {getReferenceLabel(log.reference_entity_type)}
                      </Text>
                      {['invoice', 'import_order', 'adjustment'].includes(log.reference_entity_type) && (
                        <Icon as={ExternalLink} boxSize={3} color="gray.400" />
                      )}
                    </HStack>
                    <Text fontSize="sm" fontFamily="mono" color="blue.600">
                      #{log.reference_entity_id}
                    </Text>
                  </VStack>
                </Button>
              </Td>
              <Td>
                <Text 
                  fontSize="sm" 
                  color="gray.600" 
                  maxW="200px" 
                  whiteSpace="pre-wrap"
                  wordBreak="break-word"
                >
                  {log.notes || '-'}
                </Text>
              </Td>
              <Td>
                <Text fontSize="sm" color="gray.600">
                  {formatDateTime(log.created_at)}
                </Text>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  );
};

export default InventoryLogTable;
