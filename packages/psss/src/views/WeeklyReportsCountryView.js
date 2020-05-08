/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import Typography from '@material-ui/core/Typography';
import { TableView } from './TableView';
import { Container, Main, Sidebar } from '../components';

const weeklyReportConfig = {
  resource: 'base-url/resources/weekly-reports',
};

export const WeeklyReportsCountryView = () => (
  <Container>
    <Main>
      <TableView config={weeklyReportConfig} />
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
