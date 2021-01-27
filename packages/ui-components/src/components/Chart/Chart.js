/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import { useQuery } from 'react-query';

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Brush,
  ComposedChart,
  LabelList,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Text,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export const BarChartComponent = ({ data, config }) => {
  return (
    <section>
      <Box style={{ marginLeft: '80px' }} mb={3}>
        <Typography variant="h3">{config.name}</Typography>
      </Box>
      <BarChart
        width={500}
        height={300}
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="value" fill="#8884d8" />
        {/*<Bar dataKey="uv" fill="#82ca9d" />*/}
      </BarChart>
    </section>
  );
};

export const LineChartComponent = ({ data, config }) => {
  return (
    <section>
      <Box style={{ marginLeft: '80px' }} mb={3}>
        <Typography variant="h3">{config.name}</Typography>
      </Box>
      <LineChart
        width={500}
        height={300}
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis dataKey="value" />
        <Tooltip />
        <Legend />
        {/*<Line type="monotone" dataKey={yName} stroke="#8884d8" />*/}
        <Line type="monotone" dataKey="value" stroke="#82ca9d" />
      </LineChart>
    </section>
  );
};

export const PieChartComponent = ({ data, config }) => {
  return (
    <section>
      <Box ml={2}>
        <Typography variant="h3">{config.name}</Typography>
      </Box>
      <PieChart width={500} height={500}>
        <Pie
          dataKey="value"
          isAnimationActive={false}
          data={data}
          cx={200}
          cy={200}
          outerRadius={120}
          fill="#8884d8"
          label
        />
        <Tooltip />
      </PieChart>
    </section>
  );
};

const useChartData = params => {
  return useQuery('todos', async () => {
    try {
      const { data } = await axios('https://dev-config.tupaia.org/api/v1/view', {
        params,
      });

      return data;
    } catch (error) {
      console.log('api error', error);
    }
  });
};

export const Chart = ({ projectCode, organisationUnitCode, dashboardGroupId, viewId }) => {
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

  const ChartComponent = chartType === 'pie' ? PieChartComponent : BarChartComponent;

  return <ChartComponent data={data} config={chartConfig} />;
};

Chart.propTypes = {
  projectCode: PropTypes.string.isRequired,
  organisationUnitCode: PropTypes.string.isRequired,
  dashboardGroupId: PropTypes.string.isRequired,
  viewId: PropTypes.string.isRequired,
};
