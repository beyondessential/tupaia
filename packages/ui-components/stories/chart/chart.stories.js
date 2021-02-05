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
    projectName: 'Explore',
    projectCode: 'explore',
    organisationUnit: 'explore',
    dashboarGroups: [
      {
        dashboardGroupId: '301',
        name: 'General',
        reports: ['28', '29', '8'],
      },
    ],
  },
];

export const Reports = () =>
  projects.map(project =>
    project.dashboarGroups.map(dashboardGroup => (
      <>
        <Typography variant="h1">
          {project.projectName} - {dashboardGroup.name}
        </Typography>
        {dashboardGroup.reports.map(reportId => {
          console.log('project', project);
          return (
            <Chart
              key={reportId}
              projectCode={project.projectCode}
              organisationUnitCode={project.organisationUnit}
              dashboardGroupId={dashboardGroup.dashboardGroupId}
              viewId={reportId}
              isEnlarged
            />
          );
        })}
      </>
    )),
  );
