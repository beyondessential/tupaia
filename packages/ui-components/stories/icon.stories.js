/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import Box from '@material-ui/core/Box';
import { Autorenew, Alarm, CalendarToday, ChevronRight, ChevronLeft } from '@material-ui/icons';
import { WarningCloud, Clipboard, Dashboard, Home, Virus, TupaiaIcon, ExportIcon } from '../src/components';

export default {
  title: 'Icon',
};

export const icons = () => (
  <Box p={4}>
    <TupaiaIcon />
    <WarningCloud />
    <Clipboard />
    <Dashboard />
    <Home />
    <Virus />
    <Alarm />
    <CalendarToday />
    <Autorenew />
    <ChevronRight />
    <ChevronLeft />
    <ExportIcon fill="#697074"/>
  </Box>
);
