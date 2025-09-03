import React from 'react';
import { Box } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import ImportOrderForm from '../components/ImportOrderForm';

const ImportOrderPage = () => {
  const navigate = useNavigate();

  const handleNavigateToList = () => {
    navigate('/import-orders');
  };

  return (
    <Box minH='100vh' bg='gray.50'>
      <ImportOrderForm onNavigateToList={handleNavigateToList} />
    </Box>
  );
};

export default ImportOrderPage;
