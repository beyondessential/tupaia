/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import Typography from '@material-ui/core/Typography';
import { Container, Main, Sidebar } from '../components';
import { TableView } from './TableView';

const eventBasedConfig = {
  resource: 'base-url/resources/event-based',
};

export const CountryReportsViewEventBased = () => (
  <Container>
    <Main>
      <TableView config={eventBasedConfig} />
    </Main>
    <Sidebar>
      <Typography variant="h2" gutterBottom>
        Sidebar
      </Typography>
      <Typography variant="body1" gutterBottom>
        Event Based Country View
      </Typography>
    </Sidebar>
  </Container>
);
