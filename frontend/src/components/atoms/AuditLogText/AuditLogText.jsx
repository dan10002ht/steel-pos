import React from 'react';
import { Text, Tooltip, HStack, Icon } from '@chakra-ui/react';
import { Info } from 'lucide-react';
import { generateLog, generateDetailedLog, generateLogForDisplay } from '@/utils/auditLogFormatter';

/**
 * Component to display formatted audit log text
 */
const AuditLogText = ({ 
  auditLog, 
  variant = 'simple', // 'simple', 'detailed', 'display'
  maxLength = 100,
  showTooltip = true,
  ...props 
}) => {
  if (!auditLog) {
    return <Text color="gray.500">Không có dữ liệu</Text>;
  }

  let logData;
  
  switch (variant) {
    case 'detailed':
      logData = generateDetailedLog(auditLog, true);
      break;
    case 'display':
      logData = generateLogForDisplay(auditLog, { maxLength, includeDetails: false });
      break;
    default:
      logData = generateLog(auditLog);
  }

  if (variant === 'display') {
    const { text, fullText, isTruncated } = logData;
    
    if (isTruncated && showTooltip) {
      return (
        <Tooltip label={fullText} placement="top" hasArrow>
          <HStack spacing={1}>
            <Text {...props}>{text}</Text>
            <Icon as={Info} boxSize={3} color="gray.400" />
          </HStack>
        </Tooltip>
      );
    }
    
    return <Text {...props}>{text}</Text>;
  }

  return <Text {...props}>{logData}</Text>;
};

export default AuditLogText;
