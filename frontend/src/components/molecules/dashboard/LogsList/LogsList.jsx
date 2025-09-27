import React from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  Heading,
  VStack,
  Text,
  HStack,
  Badge,
  Button,
  useColorModeValue,
} from '@chakra-ui/react';
import { Clock, User, Activity, ArrowRight } from 'lucide-react';

const LogItem = ({ log, ...props }) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // Format time from created_at
  const formatTimeAgo = createdAt => {
    const now = new Date();
    const logTime = new Date(createdAt);
    const diff = now - logTime;

    if (diff < 60000) {
      // Less than 1 minute
      return 'Vừa xong';
    } else if (diff < 3600000) {
      // Less than 1 hour
      const minutes = Math.floor(diff / 60000);
      return `${minutes} phút trước`;
    } else if (diff < 86400000) {
      // Less than 1 day
      const hours = Math.floor(diff / 3600000);
      return `${hours} giờ trước`;
    } else {
      const days = Math.floor(diff / 86400000);
      return `${days} ngày trước`;
    }
  };

  // Generate action text from raw audit log
  const generateActionText = (entityType, action) => {
    switch (entityType) {
      case 'invoice':
        switch (action) {
          case 'created':
            return 'Tạo hóa đơn mới';
          case 'updated':
            return 'Cập nhật hóa đơn';
          case 'payment_created':
            return 'Thanh toán hóa đơn';
          case 'payment_updated':
            return 'Cập nhật thanh toán';
          case 'payment_deleted':
            return 'Xóa thanh toán';
          default:
            return 'Thao tác hóa đơn';
        }
      case 'customer':
        switch (action) {
          case 'created':
            return 'Tạo khách hàng mới';
          case 'updated':
            return 'Cập nhật khách hàng';
          case 'deleted':
            return 'Xóa khách hàng';
          default:
            return 'Thao tác khách hàng';
        }
      case 'product':
        switch (action) {
          case 'created':
            return 'Tạo sản phẩm mới';
          case 'updated':
            return 'Cập nhật sản phẩm';
          case 'deleted':
            return 'Xóa sản phẩm';
          default:
            return 'Thao tác sản phẩm';
        }
      case 'user':
        switch (action) {
          case 'created':
            return 'Tạo tài khoản mới';
          case 'updated':
            return 'Cập nhật tài khoản';
          case 'deleted':
            return 'Xóa tài khoản';
          default:
            return 'Thao tác tài khoản';
        }
      case 'product_variant':
        switch (action) {
          case 'updated':
            return 'Cập nhật tồn kho';
          case 'created':
            return 'Nhập kho';
          case 'deleted':
            return 'Xuất kho';
          default:
            return 'Thao tác tồn kho';
        }
      default:
        return 'Hoạt động hệ thống';
    }
  };

  // Generate description from raw audit log
  const generateDescription = (entityType, action, entityId, newData) => {
    switch (entityType) {
      case 'invoice':
        if (action === 'payment_created' && newData && newData.amount) {
          return `Thanh toán ${newData.amount} VNĐ cho hóa đơn #${entityId}`;
        }
        return `Hóa đơn #${entityId}`;
      case 'customer':
        if (newData && newData.name) {
          return `Khách hàng: ${newData.name}`;
        }
        return `Khách hàng #${entityId}`;
      case 'product':
        if (newData && newData.name) {
          return `Sản phẩm: ${newData.name}`;
        }
        return `Sản phẩm #${entityId}`;
      case 'user':
        if (newData && newData.username) {
          return `Tài khoản: ${newData.username}`;
        }
        return `Tài khoản #${entityId}`;
      case 'product_variant':
        // For inventory logs, show quantity change info
        if (log.quantity_change !== null && log.quantity_change !== undefined) {
          const change = log.quantity_change > 0 ? '+' : '';
          return `Biến thể #${entityId}: ${change}${log.quantity_change} (${log.previous_value} → ${log.new_value})`;
        }
        return `Biến thể sản phẩm #${entityId}`;
      default:
        return `${entityType} #${entityId}`;
    }
  };

  // Get user name
  const getUserName = () => {
    if (log.created_by_name && log.created_by_name !== '') {
      return log.created_by_name;
    }
    if (log.user_name && log.user_name !== '') {
      return log.user_name;
    }
    return 'Hệ thống';
  };

  // Determine log type for color coding
  const getLogType = action => {
    switch (action) {
      case 'created':
      case 'payment_created':
        return 'create';
      case 'updated':
      case 'payment_updated':
        return 'update';
      case 'deleted':
      case 'payment_deleted':
        return 'delete';
      case 'login':
        return 'login';
      case 'logout':
        return 'logout';
      default:
        return 'info';
    }
  };

  const getLogTypeColor = type => {
    switch (type) {
      case 'login':
        return 'green';
      case 'logout':
        return 'red';
      case 'create':
        return 'blue';
      case 'update':
        return 'orange';
      case 'delete':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getLogTypeLabel = type => {
    switch (type) {
      case 'login':
        return 'Đăng nhập';
      case 'logout':
        return 'Đăng xuất';
      case 'create':
        return 'Tạo mới';
      case 'update':
        return 'Cập nhật';
      case 'delete':
        return 'Xóa';
      default:
        return 'Hoạt động';
    }
  };

  return (
    <HStack
      p={4}
      border='1px'
      borderColor={borderColor}
      borderRadius='md'
      bg={bgColor}
      spacing={4}
      align='flex-start'
      {...props}
    >
      <VStack align='flex-start' spacing={1} flex={1}>
        <HStack spacing={2} align='center'>
          <Text fontWeight='medium' fontSize='sm'>
            {generateActionText(log.entity_type, log.action)}
          </Text>
          <Badge
            colorScheme={getLogTypeColor(getLogType(log.action))}
            variant='subtle'
            fontSize='xs'
          >
            {getLogTypeLabel(getLogType(log.action))}
          </Badge>
        </HStack>
        <Text fontSize='xs' color='gray.600'>
          {generateDescription(
            log.entity_type,
            log.action,
            log.entity_id,
            log.new_data
          )}
        </Text>
        <HStack spacing={4} fontSize='xs' color='gray.500'>
          <HStack spacing={1}>
            <User size={12} />
            <Text>{getUserName()}</Text>
          </HStack>
          <HStack spacing={1}>
            <Clock size={12} />
            <Text>{formatTimeAgo(log.created_at)}</Text>
          </HStack>
        </HStack>
      </VStack>
    </HStack>
  );
};

const LogsList = ({
  logs,
  isLoading,
  onViewMore,
  hasMore = true,
  ...props
}) => {
  const bgColor = useColorModeValue('white', 'gray.800');

  if (isLoading) {
    return (
      <Card shadow='sm' bg={bgColor} {...props}>
        <CardHeader>
          <Heading size='md'>Hoạt động gần đây</Heading>
        </CardHeader>
        <CardBody>
          <VStack spacing={4} align='stretch'>
            {[1, 2, 3, 4, 5].map(i => (
              <HStack
                key={i}
                p={4}
                border='1px'
                borderColor='gray.200'
                borderRadius='md'
                bg='gray.50'
                spacing={4}
                align='flex-start'
              >
                <VStack align='flex-start' spacing={2} flex={1}>
                  <HStack spacing={2} align='center'>
                    <Text
                      fontWeight='medium'
                      fontSize='sm'
                      bg='gray.200'
                      h='4'
                      w='32'
                      borderRadius='sm'
                    />
                    <Badge bg='gray.200' h='5' w='16' borderRadius='sm' />
                  </HStack>
                  <Text
                    fontSize='xs'
                    color='gray.300'
                    bg='gray.200'
                    h='3'
                    w='48'
                    borderRadius='sm'
                  />
                  <HStack spacing={4} fontSize='xs'>
                    <Text bg='gray.200' h='3' w='20' borderRadius='sm' />
                    <Text bg='gray.200' h='3' w='16' borderRadius='sm' />
                  </HStack>
                </VStack>
              </HStack>
            ))}
          </VStack>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card shadow='sm' bg={bgColor} {...props}>
      <CardHeader>
        <Heading size='md'>Hoạt động gần đây</Heading>
      </CardHeader>
      <CardBody>
        <VStack spacing={3} align='stretch'>
          {logs && logs.length > 0 ? (
            <>
              {logs.map((log, index) => (
                <LogItem key={index} log={log} />
              ))}
              {onViewMore && hasMore && (
                <Button
                  variant='ghost'
                  size='sm'
                  rightIcon={<ArrowRight size={16} />}
                  onClick={onViewMore}
                  colorScheme='blue'
                  mt={2}
                >
                  Xem thêm
                </Button>
              )}
            </>
          ) : (
            <Text color='gray.500' textAlign='center' py={8}>
              Không có hoạt động nào gần đây
            </Text>
          )}
        </VStack>
      </CardBody>
    </Card>
  );
};

export default LogsList;
