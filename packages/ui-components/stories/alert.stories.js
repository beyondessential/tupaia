/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import Box from '@material-ui/core/Box';
import { ErrorAlert } from '../src';

export default {
  title: 'Alert',
};

export const AllAlerts = () => (
  <React.Fragment>
    <Box mb={2}>
      <ErrorAlert>ILI Above Threshold. Please review and verify data.</ErrorAlert>
    </Box>
  </React.Fragment>
);
