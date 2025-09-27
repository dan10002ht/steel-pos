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
      <Activity size={16} color='gray.500' />
      <VStack align='flex-start' spacing={1} flex={1}>
        <HStack spacing={2} align='center'>
          <Text fontWeight='medium' fontSize='sm'>
            {log.action}
          </Text>
          <Badge
            colorScheme={getLogTypeColor(log.type)}
            variant='subtle'
            fontSize='xs'
          >
            {getLogTypeLabel(log.type)}
          </Badge>
        </HStack>
        <Text fontSize='xs' color='gray.600'>
          {log.description}
        </Text>
        <HStack spacing={4} fontSize='xs' color='gray.500'>
          <HStack spacing={1}>
            <User size={12} />
            <Text>{log.user}</Text>
          </HStack>
          <HStack spacing={1}>
            <Clock size={12} />
            <Text>{log.time}</Text>
          </HStack>
        </HStack>
      </VStack>
    </HStack>
  );
};

const LogsList = ({ logs, isLoading, onViewMore, ...props }) => {
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
                <Activity size={16} color='gray.300' />
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
              {onViewMore && (
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
