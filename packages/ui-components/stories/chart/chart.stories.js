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
import { Chart } from '../../src';
import { LoginModal } from '../story-utils/LoginForm';

const Container = styled.div`
  margin: 1rem;
  width: 600px;
  height: 600px;
  color: white;
`;

const queryClient = new QueryClient();

export default {
  title: 'Chart',
  component: Chart,
  parameters: {
    backgrounds: {
      default: 'dark',
    },
  },
  decorators: [
    Story => (
      <Container>
        <QueryClientProvider client={queryClient}>
          <LoginModal />
          <Story />
        </QueryClientProvider>
      </Container>
    ),
  ],
};

const baseUrl = process.env.REACT_APP_CONFIG_SERVER_BASE_URL || 'http://localhost:8000/api/v1/';

const useDashboardData = params => {
  return useQuery(
    ['dashboard', params],
    async () => {
      try {
        const { data } = await axios(`${baseUrl}dashboard`, {
          params,
          withCredentials: true,
          credentials: 'include',
        });
        return data;
      } catch (error) {
        console.log('api error', error);
        return null;
      }
    },
    { staleTime: 60 * 1000 },
  );
};

const ProjectChartsList = ({ projectCode, organisationUnitCode, data }) => {
  return (
    <>
      <Typography variant="h1">
        {projectCode.toUpperCase()} - {organisationUnitCode}
      </Typography>
      {Object.entries(data)
        .slice(0, 12)
        .map(([heading, dashboardGroup]) => {
          return (
            <React.Fragment key={heading}>
              <Typography variant="h2">{heading}</Typography>
              <hr />
              {Object.entries(dashboardGroup).map(([groupName, groupValue]) => {
                return (
                  groupValue.views
                    .filter(chart => chart.type === 'chart')
                    // .filter(chart => chart.chartType === 'bar')
                    .map(view => {
                      return (
                        <Chart
                          key={view.viewId}
                          projectCode={projectCode}
                          organisationUnitCode={organisationUnitCode}
                          dashboardGroupId={groupValue.dashboardGroupId}
                          viewId={view.viewId}
                          periodGranularity={view.periodGranularity}
                          isEnlarged
                        />
                      );
                    })
                );
              })}
            </React.Fragment>
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

const Template = args => <Chart {...args} />;

export const SingleChart = Template.bind({});
SingleChart.args = {
  projectCode: 'fanafana',
  organisationUnitCode: 'TO',
  dashboardGroupId: 25,
  viewId: 'TO_RH_Descriptive_FP01_03',
  isEnlarged: true,
};

export const Explore = () => {
  const projectCode = 'explore';
  const organisationUnitCode = 'explore';
  const { data, isLoading } = useDashboardData({
    organisationUnitCode,
    projectCode,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return ProjectChartsList({ projectCode, organisationUnitCode, data });
};

export const Fanafana = () => {
  const projectCode = 'fanafana';
  const organisationUnitCode = 'TO';
  const { data, isLoading } = useDashboardData({
    organisationUnitCode,
    projectCode,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return ProjectChartsList({ projectCode, organisationUnitCode, data });
};
