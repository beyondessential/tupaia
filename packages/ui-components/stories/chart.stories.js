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
import { Chart } from '../src';
import { LoginModal } from './story-utils/LoginForm';

const Container = styled.div`
  padding: 2rem;
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

/**
 * Render Single Chart
 */
const Template = args => <Chart {...args} />;

export const SingleChart = Template.bind({});
SingleChart.args = {
  projectCode: 'covidau',
  organisationUnitCode: 'AU',
  dashboardGroupId: 88,
  reportId: 'COVID_Total_Cases_By_State',
  isEnlarged: true,
  isExporting: false,
};

/**
 * Render a List of Charts per Project
 */
const baseUrl = process.env.REACT_APP_CONFIG_SERVER_BASE_URL || 'http://localhost:8000/api/v1/';

const useDashboardData = params =>
  useQuery(
    ['dashboard', params],
    () =>
      axios(`${baseUrl}dashboard`, {
        params,
        withCredentials: true,
      }).then(res => res.data),
    { staleTime: 60 * 1000 },
  );

const Title = styled(Typography)`
  margin-bottom: 3rem;
`;

const ProjectChartsList = ({ projectCode, organisationUnitCode }) => {
  const { data, isLoading, isError, error } = useDashboardData({
    organisationUnitCode,
    projectCode,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return (
      <div>
        <div>{error.message}</div>
        <div>You need to have web-config-server running for this story</div>
      </div>
    );
  }

  return (
    <>
      <Title variant="h1">
        {projectCode.toUpperCase()} - {organisationUnitCode}
      </Title>
      {Object.entries(data)
        .slice(0, 12)
        .map(([heading, dashboardGroup]) => {
          return (
            <React.Fragment key={heading}>
              <Typography variant="h2">{heading}</Typography>
              <hr />
              {Object.entries(dashboardGroup).map(([groupName, groupValue]) => {
                return groupValue.views
                  .filter(chart => chart.type === 'chart')
                  .map(view => {
                    return (
                      <Chart
                        key={view.reportId}
                        projectCode={projectCode}
                        organisationUnitCode={organisationUnitCode}
                        dashboardGroupId={groupValue.dashboardGroupId}
                        reportId={view.reportId}
                        periodGranularity={view.periodGranularity}
                        isEnlarged
                      />
                    );
                  });
              })}
              <br />
            </React.Fragment>
          );
        })}
    </>
  );
};

ProjectChartsList.propTypes = {
  projectCode: PropTypes.string.isRequired,
  organisationUnitCode: PropTypes.string.isRequired,
};

export const Explore = () =>
  ProjectChartsList({ projectCode: 'explore', organisationUnitCode: 'explore' });

export const Disaster = () =>
  ProjectChartsList({ projectCode: 'disaster', organisationUnitCode: 'DL' });

export const Fanafana = () =>
  ProjectChartsList({ projectCode: 'fanafana', organisationUnitCode: 'TO' });

export const UNFPA = () => ProjectChartsList({ projectCode: 'unfpa', organisationUnitCode: 'TO' });

export const CovidAU = () =>
  ProjectChartsList({ projectCode: 'covidau', organisationUnitCode: 'AU' });

export const Strive = () =>
  ProjectChartsList({ projectCode: 'strive', organisationUnitCode: 'PG' });

export const LaosSchools = () =>
  ProjectChartsList({ projectCode: 'laos_schools', organisationUnitCode: 'LA' });
