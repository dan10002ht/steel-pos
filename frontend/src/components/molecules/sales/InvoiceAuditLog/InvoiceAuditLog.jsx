import React, { useContext, useState } from 'react';
import {
  Box,
  Card,
  CardBody,
  CardHeader,
  HStack,
  Text,
  Badge,
} from '@chakra-ui/react';
import { Clock } from 'lucide-react';
import LogTimeline from '@/components/atoms/LogTimeline';
import InvoiceComparisonModal from './InvoiceComparisonModal';
import { AuthContext } from '@/contexts/AuthContext';

const InvoiceAuditLog = ({ auditLogs = [], showDetailedLog = false }) => {
  const { isAdmin } = useContext(AuthContext);
  if (!isAdmin) return;
  const [expandedLogs, setExpandedLogs] = useState({});
  const [selectedLog, setSelectedLog] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleLogExpansion = logId => {
    setExpandedLogs(prev => ({
      ...prev,
      [logId]: !prev[logId],
    }));
  };

  const handleCompareChanges = log => {
    setSelectedLog(log);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedLog(null);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <HStack>
            <Clock size={20} />
            <Text fontWeight='bold'>Lịch sử thay đổi</Text>
            <Badge colorScheme='blue' variant='subtle'>
              {auditLogs.length}
            </Badge>
          </HStack>
        </CardHeader>
        <CardBody>
          <LogTimeline
            logs={auditLogs}
            showDetailedLog={showDetailedLog}
            onCompareChanges={handleCompareChanges}
            onToggleExpansion={toggleLogExpansion}
            expandedLogs={expandedLogs}
          />
        </CardBody>
      </Card>

      {/* <InvoiceComparisonModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        auditLog={selectedLog}
      /> */}
    </>
  );
};

export default InvoiceAuditLog;
