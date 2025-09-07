import React from 'react';
import { Card, CardHeader, CardBody, Heading, VStack } from '@chakra-ui/react';
import ActivityItem from '../../../atoms/ActivityItem';

const RecentActivities = ({ activities, ...props }) => {
  return (
    <Card shadow="sm" {...props}>
      <CardHeader>
        <Heading size="md">Hoạt động gần đây</Heading>
      </CardHeader>
      <CardBody>
        <VStack spacing={4} align="stretch">
          {activities.map((activity, index) => (
            <ActivityItem
              key={index}
              title={activity.title}
              description={activity.description}
              time={activity.time}
            />
          ))}
        </VStack>
      </CardBody>
    </Card>
  );
};

export default RecentActivities;
