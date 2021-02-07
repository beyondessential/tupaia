/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { QueryClient, QueryClientProvider, useQuery } from 'react-query';
import axios from 'axios';
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';
import { Button, Chart } from '../../src';
import { LoginForm } from '../story-utils/LoginForm';

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
          <LoginForm />
          <Story />
        </QueryClientProvider>
      </Container>
    ),
  ],
};

const baseUrl = process.env.REACT_APP_CONFIG_SERVER_BASE_URL || 'http://localhost:8000/api/v1/';

const useDashboardData = params => {
  return useQuery(['dashboard', params], async () => {
    try {
      const { data } = await axios(`${baseUrl}dashboard`, {
        params: { ...params, cacheBreaker: Math.random().toString(36).substring(7) },
        withCredentials: true,
        credentials: 'include',
      });
      return data;
    } catch (error) {
      console.log('api error', error);
      return null;
    }
  });
};

const ProjectChartsList = ({ projectCode, organisationUnitCode, data }) => {
  return (
    <>
      <Typography variant="h1">
        {projectCode.toUpperCase()} - {organisationUnitCode}
      </Typography>
      {Object.entries(data).map(([heading, dashboardGroup]) => {
        return (
          <>
            <Typography variant="h2">{heading}</Typography>
            {Object.entries(dashboardGroup).map(([groupName, groupValue]) => {
              return groupValue.views
                .filter(chart => chart.type === 'chart')
                .map(view => {
                  return (
                    <Chart
                      key={view.viewId}
                      projectCode={projectCode}
                      organisationUnitCode={organisationUnitCode}
                      dashboardGroupId={groupValue.dashboardGroupId}
                      viewId={view.viewId}
                      isEnlarged
                    />
                  );
                });
            })}
          </>
        );
      })}
    </>
  );
};

ProjectChartsList.propTypes = {
  projectCode: PropTypes.string.isRequired,
  organisationUnitCode: PropTypes.string.isRequired,
  data: PropTypes.object.isRequired,
};

export const Fanafana = () => {
  const projectCode = 'fanafana';
  const organisationUnitCode = 'TO';
  const { data, isLoading, isFetching } = useDashboardData({
    organisationUnitCode,
    projectCode,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }
  console.log('data', data);

  return ProjectChartsList({ projectCode, organisationUnitCode, data });
};

const explore = [
  {
    dashboardGroupId: '301',
    name: 'General',
    reports: ['28', '29', '8'],
  },
];
