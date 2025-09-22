import React from "react";
import {
  Box,
  Card,
  CardBody,
  Text,
  Grid,
} from "@chakra-ui/react";

const CustomerInfoCard = ({ customer }) => {
  if (!customer) {
    return null;
  }

  return (
    <Card>
      <CardBody>
        <Text fontSize="lg" fontWeight="bold" mb={4}>
          Thông tin khách hàng
        </Text>
        <Grid templateColumns="repeat(2, 1fr)" gap={4}>
          <Box>
            <Text fontWeight="medium" color="gray.600">
              Họ và tên
            </Text>
            <Text>{customer.customer_name}</Text>
          </Box>
          <Box>
            <Text fontWeight="medium" color="gray.600">
              Số điện thoại
            </Text>
            <Text>{customer.customer_phone}</Text>
          </Box>
          <Box>
            <Text fontWeight="medium" color="gray.600">
              Địa chỉ
            </Text>
            <Text>{customer.customer_address || "Không có địa chỉ"}</Text>
          </Box>
        </Grid>
      </CardBody>
    </Card>
  );
};

export default CustomerInfoCard;




