/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';
import { ErrorOutline, NotificationImportant } from '@material-ui/icons';
import {
  CircleMeter,
  BaseToolbar,
  Card,
  CardContent,
  CardHeader,
  DataCardTabs,
} from '@tupaia/ui-components';
import { Container, Main, Sidebar, Header, CountriesTable } from '../components';

const StyledCardContent = styled(CardContent)`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ExampleContent = styled.div`
  padding: 3rem 1rem;
  text-align: center;
`;

const tabData = [
  {
    label: (
      <React.Fragment>
        <ErrorOutline /> 3 Active Alerts
      </React.Fragment>
    ),
    content: <ExampleContent>Table Content</ExampleContent>,
  },
  {
    label: (
      <React.Fragment>
        <NotificationImportant /> 1 Active Outbreak
      </React.Fragment>
    ),
    content: <ExampleContent>Table Content</ExampleContent>,
  },
];

export const CountriesReportsView = () => (
  <React.Fragment>
    <Header title="Countries" />
    <BaseToolbar />
    <Container>
      <Main>
        <CountriesTable foo="bar" />
      </Main>
      <Sidebar>
        <Card variant="outlined">
          <CardHeader title="Current reports submitted" label="Week 10" />
          <StyledCardContent>
            <Typography variant="h3">11/22 Countries</Typography>
            <CircleMeter value={11} total={22} />
          </StyledCardContent>
        </Card>
        <Card variant="outlined">
          <DataCardTabs data={tabData} />
        </Card>
      </Sidebar>
    </Container>
  </React.Fragment>
);
