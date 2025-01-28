import React from 'react';
import Skeleton from '@material-ui/lab/Skeleton';
import Box from '@material-ui/core/Box';

const BigSkeleton = () => (
  <Box display="flex" alignItems="center" mb={2}>
    <Skeleton animation="wave" height={40} width={30} style={{ marginRight: 10 }} />
    <Skeleton animation="wave" height={40} width={200} />
  </Box>
);

const SmallSkeleton = () => (
  <Box display="flex" alignItems="center" mb={1}>
    <Skeleton animation="wave" height={30} width={30} style={{ marginRight: 10 }} />
    <Skeleton animation="wave" height={30} width={300} />
  </Box>
);

export const MapOverlaysLoader = () => (
  <Box pl={3} pr={2} py={2}>
    <BigSkeleton />
    <BigSkeleton />
    <Box pl={3} pr={5} pb={2}>
      <SmallSkeleton />
      <SmallSkeleton />
      <SmallSkeleton />
      <SmallSkeleton />
      <SmallSkeleton />
      <SmallSkeleton />
      <SmallSkeleton />
      <SmallSkeleton />
    </Box>
    <BigSkeleton />
    <BigSkeleton />
    <BigSkeleton />
    <BigSkeleton />
    <BigSkeleton />
  </Box>
);
