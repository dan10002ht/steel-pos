import React from "react";
import { Card, CardBody, Stat, StatLabel, StatNumber, StatHelpText, Icon } from "@chakra-ui/react";

const CustomerStatCard = ({ label, value, helpText, icon: IconComponent, colorScheme = "blue" }) => {
  return (
    <Card>
      <CardBody>
        <Stat>
          <StatLabel>{label}</StatLabel>
          <StatNumber>{value}</StatNumber>
          <StatHelpText>
            <Icon as={IconComponent} size={14} />
            {" "}{helpText}
          </StatHelpText>
        </Stat>
      </CardBody>
    </Card>
  );
};

export default CustomerStatCard;
