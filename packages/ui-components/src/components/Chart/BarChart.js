/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import {
  Bar,
  BarChart as BarChartComponent,
  Legend,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export const BarChart = ({ data, config }) => {
  return (
    <section>
      <Box style={{ marginLeft: '80px' }} mb={3}>
        <Typography variant="h3">{config.name}</Typography>
      </Box>
      <BarChartComponent
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
      </BarChartComponent>
    </section>
  );
};

BarChart.propTypes = {
  data: PropTypes.object.isRequired,
  config: PropTypes.object.isRequired,
};
