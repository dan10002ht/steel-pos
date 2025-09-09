import React from "react";
import { Card, CardHeader, CardBody, VStack, HStack, Divider, Box, Text } from "@chakra-ui/react";
import InfoField from "../../atoms/InfoField";
import { formatDateTime, formatPhoneNumber } from "../../../utils/formatters";

const CustomerInfoSection = ({ customer }) => {
  return (
    <Card>
      <CardHeader>
        <Text fontSize="lg" fontWeight="bold">
          Thông tin khách hàng
        </Text>
      </CardHeader>
      <CardBody>
        <VStack spacing={4} align="stretch">
          <HStack spacing={4} align="start">
            <InfoField 
              label="Tên khách hàng" 
              value={customer.name}
            />
            <InfoField 
              label="ID khách hàng" 
              value={`#${customer.id}`}
              isMonospace
            />
          </HStack>

          <Divider />

          <HStack spacing={4} align="start">
            <InfoField 
              label="Số điện thoại" 
              value={formatPhoneNumber(customer.phone)}
              isMonospace
            />
            <InfoField 
              label="Ngày tạo" 
              value={formatDateTime(customer.created_at)}
            />
          </HStack>

          {customer.address && (
            <>
              <Divider />
              <Box>
                <Text fontSize="sm" color="gray.600">
                  Địa chỉ
                </Text>
                <Text fontSize="md">
                  {customer.address}
                </Text>
              </Box>
            </>
          )}

          <Divider />

          <HStack spacing={4} align="start">
            <InfoField 
              label="Cập nhật lần cuối" 
              value={formatDateTime(customer.updated_at)}
            />
            <InfoField 
              label="Người tạo" 
              value={customer.created_by ? `User #${customer.created_by}` : 'Hệ thống'}
            />
          </HStack>
        </VStack>
      </CardBody>
    </Card>
  );
};

export default CustomerInfoSection;
