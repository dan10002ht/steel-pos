import React from 'react';
import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Text,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  HStack,
  VStack,
  Button,
  Divider,
  Grid,
  GridItem,
  IconButton,
  useToast,
  Image,
  SimpleGrid,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from '@chakra-ui/react';
import {
  ArrowLeft,
  Edit,
  Download,
  Printer,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFetchApi } from '../../hooks/useFetchApi';

import Page from '../../components/organisms/Page';
import { formatCurrency, formatDate } from '../../utils/formatters';

const InventoryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedImageIndex, setSelectedImageIndex] = React.useState(0);

  // Fetch import order detail
  const { data: importOrderData, error } = useFetchApi(
    ['import-order', id],
    `/import-orders/${id}`
  );

  const importOrder = importOrderData || null;
  const images = importOrder?.import_images || [];
  console.log({ importOrder });

  const handleEdit = () => {
    navigate(`/inventory/${id}/edit`);
  };

  const handleBack = () => {
    navigate('/inventory');
  };

  const handleImageClick = React.useCallback(
    index => {
      setSelectedImageIndex(index);
      onOpen();
    },
    [onOpen]
  );

  const handlePrevImage = React.useCallback(() => {
    setSelectedImageIndex(prev => (prev > 0 ? prev - 1 : images.length - 1));
  }, [images.length]);

  const handleNextImage = React.useCallback(() => {
    setSelectedImageIndex(prev => (prev < images.length - 1 ? prev + 1 : 0));
  }, [images.length]);

  // Keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = e => {
      if (!isOpen) return;

      if (e.key === 'ArrowLeft') {
        handlePrevImage();
      } else if (e.key === 'ArrowRight') {
        handleNextImage();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, images.length, handlePrevImage, handleNextImage, onClose]);

  if (error) {
    toast({
      title: 'Lỗi',
      description: error.message || 'Không thể tải thông tin đơn nhập hàng',
      status: 'error',
      duration: 3000,
      isClosable: true,
    });
  }

  if (!importOrder) {
    return (
      <Page title='Chi tiết đơn nhập hàng' onBack={handleBack}>
        <Box>Đang tải...</Box>
      </Page>
    );
  }

  return (
    <Page
      title={
        <HStack align='center'>
          <Text>Chi tiết đơn nhập hàng</Text>
          <Badge
            colorScheme={importOrder.status === 'approved' ? 'green' : 'orange'}
            fontSize='xs'
            px={3}
            py={1}
          >
            {importOrder.status === 'approved'
              ? 'Đã phê duyệt'
              : 'Chờ phê duyệt'}
          </Badge>
        </HStack>
      }
      subtitle={`Mã đơn: ${importOrder.import_code}`}
      onBack={handleBack}
      primaryActions={[
        importOrder.status === 'pending' && {
          label: 'Sửa',
          onClick: handleEdit,
          colorScheme: 'blue',
          leftIcon: <Edit size={16} />,
        },
      ].filter(Boolean)}
    >
      <Box w='100%' maxW='100%' mx='auto'>
        {/* Order Information */}
        <Card mb={6}>
          <CardHeader pb="0">
            <Heading size={{ base: 'sm', md: 'md' }}>
              Thông tin đơn nhập hàng
            </Heading>
          </CardHeader>
          <CardBody>
            <Grid
              templateColumns={{
                base: '1fr',
                md: 'repeat(2, 1fr)',
                lg: 'repeat(auto-fit, minmax(300px, 1fr))',
              }}
              gap={6}
            >
              <GridItem>
                <VStack align='start' spacing={3}>
                  <Box>
                    <Text fontWeight='bold' color='gray.600' fontSize='sm'>
                      Mã đơn nhập hàng
                    </Text>
                    <Text fontSize='lg'>{importOrder.import_code}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight='bold' color='gray.600' fontSize='sm'>
                      Nhà cung cấp
                    </Text>
                    <Text fontSize='lg'>{importOrder.supplier_name}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight='bold' color='gray.600' fontSize='sm'>
                      Ngày nhập kho
                    </Text>
                    <Text fontSize='lg'>
                      {formatDate(importOrder.import_date)}
                    </Text>
                  </Box>
                </VStack>
              </GridItem>
              <GridItem>
                <VStack align='start' spacing={3}>
                  <Box>
                    <Text fontWeight='bold' color='gray.600' fontSize='sm'>
                      Tổng giá trị
                    </Text>
                    <Text fontSize='lg' fontWeight='bold' color='blue.600'>
                      {formatCurrency(importOrder.total_amount)}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontWeight='bold' color='gray.600' fontSize='sm'>
                      Số lượng sản phẩm
                    </Text>
                    <Text fontSize='lg'>{importOrder.items?.length || 0}</Text>
                  </Box>
                </VStack>
              </GridItem>
            </Grid>
            {importOrder.notes && (
              <>
                <Divider my={4} />
                <Box>
                  <Text fontWeight='bold' color='gray.600' fontSize='sm' mb={2}>
                    Ghi chú
                  </Text>
                  <Text>{importOrder.notes}</Text>
                </Box>
              </>
            )}
            {importOrder.approval_note && (
              <>
                <Divider my={4} />
                <Box>
                  <Text fontWeight='bold' color='gray.600' fontSize='sm' mb={2}>
                    Ghi chú phê duyệt
                  </Text>
                  <Text>{importOrder.approval_note}</Text>
                </Box>
              </>
            )}
          </CardBody>
        </Card>

        {/* Import Images / Documents */}
        {importOrder.import_images && importOrder.import_images.length > 0 && (
          <Card mb={6}>
            <CardHeader pb="0">
              <Heading size={{ base: 'sm', md: 'md' }}>
                Hình ảnh chứng từ
              </Heading>
            </CardHeader>
            <CardBody>
              <SimpleGrid
                columns={{ base: 2, sm: 3, md: 4, lg: 5 }}
                spacing={4}
              >
                {importOrder.import_images.map((imageUrl, index) => (
                  <Box
                    key={index}
                    position='relative'
                    cursor='pointer'
                    onClick={() => handleImageClick(index)}
                    _hover={{
                      transform: 'scale(1.05)',
                      transition: 'all 0.2s',
                    }}
                  >
                    <Image
                      src={imageUrl}
                      alt={`Chứng từ ${index + 1}`}
                      boxSize='120px'
                      objectFit='cover'
                      borderRadius='md'
                      border='1px solid'
                      borderColor='gray.200'
                      loading='lazy'
                    />
                    <Text
                      fontSize='xs'
                      color='gray.500'
                      mt={1}
                      textAlign='center'
                      noOfLines={1}
                    >
                      Chứng từ {index + 1}
                    </Text>
                  </Box>
                ))}
              </SimpleGrid>
            </CardBody>
          </Card>
        )}

        {/* Items Table */}
        <Card>
          <CardHeader pb="0">
            <Heading size={{ base: 'sm', md: 'md' }}>
              Danh sách sản phẩm
            </Heading>
          </CardHeader>
          <CardBody>
            <Box overflowX='auto'>
              <Table variant='simple' size='sm'>
                <Thead>
                  <Tr>
                    <Th>STT</Th>
                    <Th>Sản phẩm</Th>
                    <Th>Phân loại</Th>
                    <Th isNumeric>Số lượng</Th>
                    <Th>Đơn vị</Th>
                    <Th isNumeric>Đơn giá</Th>
                    <Th isNumeric>Thành tiền</Th>
                    <Th>Ghi chú</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {importOrder.items?.map((item, index) => (
                    <Tr key={index}>
                      <Td>{index + 1}</Td>
                      <Td>{item.product_name}</Td>
                      <Td>{item.variant_name}</Td>
                      <Td isNumeric>{item.quantity}</Td>
                      <Td>{item.unit}</Td>
                      <Td isNumeric>{formatCurrency(item.unit_price)}</Td>
                      <Td isNumeric>{formatCurrency(item.total_price)}</Td>
                      <Td>{item.notes || '-'}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          </CardBody>
        </Card>
      </Box>

      {/* Image Preview Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size='full' isCentered>
        <ModalOverlay bg='blackAlpha.900' />
        <ModalContent bg='transparent' boxShadow='none'>
          <ModalCloseButton
            color='white'
            bg='blackAlpha.600'
            _hover={{ bg: 'blackAlpha.800' }}
            size='lg'
            zIndex={3}
            top={4}
            right={4}
          />

          {/* Image counter */}
          {images.length > 1 && (
            <Box
              position='absolute'
              top={4}
              left='50%'
              transform='translateX(-50%)'
              bg='blackAlpha.600'
              color='white'
              px={4}
              py={2}
              borderRadius='md'
              fontSize='sm'
              fontWeight='medium'
              zIndex={3}
            >
              {selectedImageIndex + 1} / {images.length}
            </Box>
          )}

          <ModalBody
            p={0}
            display='flex'
            justifyContent='center'
            alignItems='center'
            position='relative'
          >
            {/* Previous button */}
            {images.length > 1 && (
              <IconButton
                icon={<ChevronLeft size={32} />}
                position='absolute'
                left={4}
                top='50%'
                transform='translateY(-50%)'
                onClick={handlePrevImage}
                colorScheme='whiteAlpha'
                bg='blackAlpha.600'
                _hover={{ bg: 'blackAlpha.800' }}
                size='lg'
                borderRadius='full'
                zIndex={2}
                aria-label='Previous image'
              />
            )}

            {/* Image */}
            {images[selectedImageIndex] && (
              <Image
                src={images[selectedImageIndex]}
                alt={`Chứng từ ${selectedImageIndex + 1}`}
                maxH='90vh'
                maxW='90vw'
                objectFit='contain'
                borderRadius='md'
              />
            )}

            {/* Next button */}
            {images.length > 1 && (
              <IconButton
                icon={<ChevronRight size={32} />}
                position='absolute'
                right={4}
                top='50%'
                transform='translateY(-50%)'
                onClick={handleNextImage}
                colorScheme='whiteAlpha'
                bg='blackAlpha.600'
                _hover={{ bg: 'blackAlpha.800' }}
                size='lg'
                borderRadius='full'
                zIndex={2}
                aria-label='Next image'
              />
            )}

            {/* Bottom navigation hint */}
            {images.length > 1 && (
              <Box
                position='absolute'
                bottom={4}
                left='50%'
                transform='translateX(-50%)'
                bg='blackAlpha.600'
                color='white'
                px={4}
                py={2}
                borderRadius='md'
                fontSize='xs'
                zIndex={3}
              >
                Dùng phím ← → để chuyển ảnh
              </Box>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Page>
  );
};

export default InventoryDetail;
