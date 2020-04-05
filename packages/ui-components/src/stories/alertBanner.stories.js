/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import Box from '@material-ui/core/Box';
import { ErrorAlert, WarningAlert, InfoAlert, SuccessAlert } from '../components/AlertBanner';

export default {
  title: 'Alert',
};

export const AllAlerts = () => (
  <>
    <Box mb={2}>
      <ErrorAlert>ILI Above Threhold. Please review and verify data.</ErrorAlert>
    </Box>
    <Box mb={2}>
      <WarningAlert>ILI Above Threhold. Please review and verify data.</WarningAlert>
    </Box>
    <Box mb={2}>
      <InfoAlert>ILI Above Threhold. Please review and verify data.</InfoAlert>
    </Box>
    <Box mb={2}>
      <SuccessAlert>ILI Above Threhold. Please review and verify data.</SuccessAlert>
    </Box>
  </>
);
