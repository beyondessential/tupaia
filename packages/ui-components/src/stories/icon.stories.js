/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import Box from '@material-ui/core/Box';
import { Autorenew, Alarm, CalendarToday, ChevronRight, ChevronLeft } from '@material-ui/icons';
import { Alerts, Cases, Dashboard, Home, Outbreaks } from '../components/Icons';

export default {
  title: 'Icon',
};

export const icons = () => (
  <Box p={4}>
    <Alerts />
    <Cases />
    <Dashboard />
    <Home />
    <Outbreaks />
    <Alarm />
    <CalendarToday />
    <Autorenew />
    <ChevronRight />
    <ChevronLeft />
  </Box>
);
