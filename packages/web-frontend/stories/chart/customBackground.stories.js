/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { ReferenceArea, ComposedChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { CartesianChart } from '../../src/components/View/ChartWrapper/CartesianChart';
import data from './cartesianData.json';

const Container = styled.div`
  margin: 1rem auto;
  width: 600px;
  height: 400px;
`;

export default {
  title: 'Chart/Cartesian',
  component: CartesianChart,
  decorators: [
    Story => (
      <Container>
        <Story />
      </Container>
    ),
  ],
};

const viewContent = {
  data: data,
  viewId: '13',
  organisationUnitCode: 'DL',
  dashboardGroupId: '108',
  startDate: '2015-01-01',
  endDate: '2020-08-31',
  name: 'Medicines Availability by Clinic',
  type: 'chart',
  xName: 'Clinic',
  yName: '%',
  chartType: 'bar',
  valueType: 'percentage',
  periodGranularity: 'month',
  chartConfig: {
    chartType: 'bar',
    value: 'value',
    referenceAreas: [
      {
        key: 1,
        y1: 0,
        y2: 0.2,
        stroke: '#6ab04c',
        fill: '#6ab04c',
        fillOpacity: 0.8,
        strokeOpacity: 0.8,
      },
      {
        key: 2,
        y1: 0.2,
        y2: 0.4,
        stroke: '#f0932b',
        fill: '#f0932b',
        fillOpacity: 0.8,
        strokeOpacity: 0.8,
      },
      {
        key: 3,
        y1: 0.4,
        y2: 0.6,
        stroke: '#eb4d4b',
        fill: '#eb4d4b',
        fillOpacity: 0.8,
        strokeOpacity: 0.8,
      },
      {
        key: 4,
        y1: 0.6,
        y2: 0.8,
        stroke: '#eb4d4b',
        fill: '#eb4d4b',
        fillOpacity: 0.8,
        strokeOpacity: 0.8,
      },
    ],
  },
};

export const Composed = () => <CartesianChart viewContent={viewContent} />;

export const JSXExample = () => (
  <ComposedChart width={500} height={400} data={data}>
    <ReferenceArea
      y1={0}
      y2={0.2}
      stroke="#6ab04c"
      fill="#6ab04c"
      fillOpacity={0.3}
      strokeOpacity={0.2}
    />
    <ReferenceArea
      y1={0.2}
      y2={0.4}
      stroke="#f0932b"
      fill="#f0932b"
      fillOpacity={0.3}
      strokeOpacity={0.2}
    />
    <ReferenceArea
      y1={0.4}
      y2={0.6}
      stroke="#eb4d4b"
      fill="#eb4d4b"
      fillOpacity={0.3}
      strokeOpacity={0.2}
    />
    <ReferenceArea
      y1={0.6}
      y2={0.8}
      stroke="#eb4d4b"
      fill="#eb4d4b"
      fillOpacity={0.35}
      strokeOpacity={0.2}
    />
    <XAxis dataKey="name" />
    <YAxis dataKey="value" />
    <Tooltip />
    <Bar dataKey="value" barSize={20} fill="#413ea0" />
    <Legend />
  </ComposedChart>
);
