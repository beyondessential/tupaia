/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import Typography from '@material-ui/core/Typography';
import { Container, Main, Sidebar, CountryTable } from '../components';

export const CountryReportsViewWeekly = () => (
  <Container>
    <Main>
      <CountryTable />
    </Main>
    <Sidebar>
      <Typography variant="h2" gutterBottom>
        Sidebar
      </Typography>
      <Typography variant="body1" gutterBottom>
        Weekly Reports Country View
      </Typography>
    </Sidebar>
  </Container>
);
