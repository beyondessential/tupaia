/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import Box from '@material-ui/core/Box';
import { ErrorAlert, SmallErrorAlert } from '../src';

export default {
  title: 'Alert',
};

export const Alerts = () => (
  <React.Fragment>
    <Box mb={2}>
      <ErrorAlert>ILI Above Threshold. Please review and verify data.</ErrorAlert>
    </Box>
    <Box mb={2}>
      <SmallErrorAlert>Updating aggregated data will be the source of truth. All individual Sentinel data will be ignored.</SmallErrorAlert>
    </Box>
  </React.Fragment>
);
