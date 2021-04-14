/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React from 'react';
import Skeleton from '@material-ui/lab/Skeleton';
import Box from '@material-ui/core/Box';

const BigSkeleton = () => <Skeleton animation="wave" height={36} style={{ marginBottom: 18 }} />;
const SmallSkeleton = () => <Skeleton animation="wave" height={32} />;
export const MapOverlaysLoader = () => (
  <Box pl={3} pr={5} py={2}>
    <BigSkeleton />
    <Skeleton animation="wave" height={36} />
    <Box pl={4} pr={5} pt={1} pb={3}>
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
