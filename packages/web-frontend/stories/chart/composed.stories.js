/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { CartesianChart } from '../../src/components/View/ChartWrapper/CartesianChart';
import data from './data/composed.json';

const Container = styled.div`
  margin: 1rem auto;
  width: 600px;
  height: 400px;
`;

export default {
  title: 'Chart/Composed',
  component: CartesianChart,
  decorators: [
    Story => (
      <Container>
        <Story />
      </Container>
    ),
  ],
};

const Template = args => <CartesianChart {...args} />;

export const Composed = Template.bind({});
Composed.args = {
  isEnlarged: true,
  viewContent: {
    data,
    viewId: '13',
    organisationUnitCode: 'DL',
    dashboardGroupId: '108',
    startDate: '2015-01-01',
    endDate: '2020-08-31',
    name: 'Medicines Availability by Clinic',
    type: 'chart',
    xName: 'Clinic',
    yName: '%',
    chartType: 'composed',
    valueType: 'percentage',
    periodGranularity: 'month',
    chartConfig: {
      value1: {
        chartType: 'bar',
        color: '#6ab04c',
      },
      value2: {
        chartType: 'bar',
        color: '#f0932b',
      },
      value3: {
        chartType: 'line',
        color: '#ffffff',
      },
    },
  },
};
