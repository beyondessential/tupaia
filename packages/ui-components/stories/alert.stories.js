/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import MuiBox from '@material-ui/core/Box';
import { Alert, SmallAlert } from '../src';

export default {
  title: 'Alert',
};

const Container = styled(MuiBox)`
  padding: 1rem 0;

  & > div {
    margin-bottom: 1rem;
  }
`;

export const Alerts = () => (
  <Container>
    <Alert severity="error">ILI Above Threshold. Please review and verify data.</Alert>
    <Alert severity="success">Message successfully saved.</Alert>
    <Alert severity="error" variant="standard">ILI Above Threshold. Please review and verify data.</Alert>
    <SmallAlert severity="error">ILI Above Threshold. Please review and verify data.</SmallAlert>
    <SmallAlert severity="success">Message successfully saved.</SmallAlert>
    <SmallAlert severity="error" variant="standard">ILI Above Threshold. Please review and verify data.</SmallAlert>
  </Container>
);
