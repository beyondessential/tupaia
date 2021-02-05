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

const projects = [
  {
    projectCode: 'explore',
    organisationUnit: 'explore',
    dashboarGroups: [
      // {
      //   dashboardGroupId: '309',
      //   reports: ['WHO_SURVEY', 'WHO_IHR_SPAR_WPRO', 'WHO_IHR_SPAR_NST', 'WHO_IHR_JEE_WPRO'],
      // },
      {
        dashboardGroupId: '301',
        reports: ['28', '29', '8', '23'],
      },
    ],
  },
];

export const Reports = () =>
  projects.map(project =>
    project.dashboarGroups.map(dashboardGroup =>
      {
        return dashboardGroup.reports.map(reportId => (
          <Chart
            key={reportId}
            projectCode={project.projectCode}
            organisationUnitCode={project.organisationUnit}
            dashboardGroupId={dashboardGroup.dashboardGroupId}
            viewId={reportId}
            isEnlarged
          />
        )),
      }
    ),
  );
