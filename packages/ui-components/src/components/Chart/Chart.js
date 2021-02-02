/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { useQuery } from 'react-query';
import { LineChart } from './LineChart';
import { PieChart } from './PieChart';
import { BarChart } from './BarChart';

// Dev https://dev-config.tupaia.org/api/v1/view
const useChartData = params => {
  return useQuery('chart', async () => {
    try {
      const { data } = await axios('https://dev-config.tupaia.org/api/v1/view', {
        params,
      });

      return data;
    } catch (error) {
      console.log('api error', error);
      return null;
    }
  });
};

export const Chart = ({ projectCode, organisationUnitCode, dashboardGroupId, viewId }) => {
  console.log('chart');
  const { data: response, isLoading, error } = useChartData({
    projectCode,
    organisationUnitCode,
    dashboardGroupId,
    viewId,
  });

  if (isLoading) {
    return '...loading';
  }

  if (error || !response) {
    return 'There was an error...';
  }

  const { data, chartType, ...chartConfig } = response;

  const ChartComponent = chartType === 'pie' ? PieChart : BarChart;

  return <ChartComponent data={data} config={chartConfig} />;
};

Chart.propTypes = {
  projectCode: PropTypes.string.isRequired,
  organisationUnitCode: PropTypes.string.isRequired,
  dashboardGroupId: PropTypes.string.isRequired,
  viewId: PropTypes.string.isRequired,
};
