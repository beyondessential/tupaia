/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
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
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Text,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export const CartesianChart = ({ config, data }) => {
  console.log('config', config);
  console.log('data', data);
  return (
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
      <YAxis />
      <Tooltip />
      <Legend />
      <Line type="monotone" dataKey="pv" stroke="#8884d8" activeDot={{ r: 8 }} />
      <Line type="monotone" dataKey="uv" stroke="#82ca9d" />
    </LineChart>
  );
};

CartesianChart.propTypes = {
  config: PropTypes.shape({}).isRequired, // The main configuration from the database
  data: PropTypes.shape({}).isRequired,
};
