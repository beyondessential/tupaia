/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import Typography from '@material-ui/core/Typography';
import { BaseToolbar } from '@tupaia/ui-components';
import { Container, Main, Sidebar, Header, CountriesTable } from '../components';

export const WeeklyReportsView = () => {
  return (
    <React.Fragment>
      <Header title="Countries" />
      <BaseToolbar />
      <Container>
        <Main>
          <CountriesTable />
        </Main>
        <Sidebar>
          <Typography variant="h2" gutterBottom>
            Sidebar
          </Typography>
          <Typography variant="body1" gutterBottom>
            Home Page
          </Typography>
        </Sidebar>
      </Container>
    </React.Fragment>
  );
};
