/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';
import { Chart } from '../../src';

const Container = styled.div`
  margin: 1rem auto;
  width: 600px;
  height: 400px;
  color: white;
`;

const queryClient = new QueryClient();

export default {
  title: 'Chart',
  component: Chart,
  decorators: [
    Story => (
      <Container>
        <QueryClientProvider client={queryClient}>
          <Story />
        </QueryClientProvider>
      </Container>
    ),
  ],
};

const explore = [
  {
    dashboardGroupId: '301',
    name: 'General',
    reports: ['28', '29', '8'],
  },
];

export const Explore = () =>
  explore.map(dashboardGroup => (
    <React.Fragment key={dashboardGroup.name}>
      <Typography variant="h1">Explore - {dashboardGroup.name}</Typography>
      {dashboardGroup.reports.map(reportId => {
        return (
          <Chart
            key={reportId}
            projectCode="explore"
            organisationUnitCode="explore"
            dashboardGroupId={dashboardGroup.dashboardGroupId}
            viewId={reportId}
            isEnlarged
          />
        );
      })}
    </React.Fragment>
  ));

const fanafana = [
  {
    dashboardGroupId: '227',
    name: 'General',
    reports: ['8'],
  },
];

export const Fanafana = () =>
  fanafana.map(dashboardGroup => (
    <React.Fragment key={dashboardGroup.name}>
      <Typography key={dashboardGroup.name} variant="h1">
        Fanafana - {dashboardGroup.name}
      </Typography>
      {dashboardGroup.reports.map(reportId => {
        return (
          <Chart
            key={`${dashboardGroup.name}-${reportId}`}
            projectCode="fanafana"
            organisationUnitCode="TO"
            dashboardGroupId={dashboardGroup.dashboardGroupId}
            viewId={reportId}
            isEnlarged
          />
        );
      })}
    </React.Fragment>
  ));
