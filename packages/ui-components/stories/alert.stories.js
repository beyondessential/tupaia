/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import Box from '@material-ui/core/Box';
import { ErrorAlert, LightErrorAlert, SmallErrorAlert, SmallLightErrorAlert } from '../src';

export default {
  title: 'Alert',
};

export const Alerts = () => (
  <React.Fragment>
    <Box mb={2}>
      <ErrorAlert>ILI Above Threshold. Please review and verify data.</ErrorAlert>
    </Box>
    <Box mb={2}>
      <LightErrorAlert>ILI Above Threshold. Please review and verify data.</LightErrorAlert>
    </Box>
    <Box mb={2}>
      <SmallErrorAlert>ILI Above Threshold. Please review and verify data.</SmallErrorAlert>
    </Box>
    <Box mb={2}>
      <SmallLightErrorAlert>ILI Above Threshold. Please review and verify data.</SmallLightErrorAlert>
    </Box>
  </React.Fragment>
);
