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
    <Alert type="error">ILI Above Threshold. Please review and verify data.</Alert>
    <Alert type="success">Message successfully saved.</Alert>
    <Alert type="lightError">ILI Above Threshold. Please review and verify data.</Alert>
    <Alert type="lightSuccess">Message successfully saved.</Alert>
    <SmallAlert type="error">ILI Above Threshold. Please review and verify data.</SmallAlert>
    <SmallAlert type="success">ILI Above Threshold. Please review and verify data.</SmallAlert>
    <SmallAlert type="lightError">ILI Above Threshold. Please review and verify data.</SmallAlert>
    <SmallAlert type="lightSuccess">ILI Above Threshold. Please review and verify data.</SmallAlert>
  </Container>
);
