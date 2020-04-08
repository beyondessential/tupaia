/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import Box from '@material-ui/core/Box';
import {
  AddBoxOutlined,
  IndeterminateCheckBox,
  Autorenew,
  ChevronRight,
  ChevronLeft,
} from '@material-ui/icons';
import {
  Alerts,
  Calendar,
  Cases,
  Dashboard,
  Expand,
  Export,
  Minimize,
  Outbreaks,
  Sort,
  Submit,
  Warning,
} from '../components/Icons';

export default {
  title: 'Icon',
};

export const icons = () => (
  <>
    <Box p={4}>
      <AddBoxOutlined />
      <Alerts />
      <Calendar />
      <Cases />
      <Dashboard />
      <Expand />
      <Export />
      <Minimize />
      <Outbreaks />
      <Sort />
      <Submit />
      <Warning />
      <IndeterminateCheckBox />
      <Autorenew />
      <ChevronRight />
      <ChevronLeft />
    </Box>
  </>
);
