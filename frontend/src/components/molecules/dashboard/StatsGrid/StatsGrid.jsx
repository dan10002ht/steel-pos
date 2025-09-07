import React from 'react';
import { SimpleGrid } from '@chakra-ui/react';
import StatCard from '../../../atoms/StatCard';

const StatsGrid = ({ stats, ...props }) => {
  return (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} {...props}>
      {stats.map((stat, index) => (
        <StatCard
          key={index}
          label={stat.label}
          value={stat.value}
          change={stat.change}
          icon={stat.icon}
          color={stat.color}
        />
      ))}
    </SimpleGrid>
  );
};

export default StatsGrid;
