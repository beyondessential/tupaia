/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { CartesianChart } from '../../src/components/View/ChartWrapper/CartesianChart';
import data from './data/bar.json';

const Container = styled.div`
  margin: 1rem auto;
  width: 600px;
  height: 400px;
`;

export default {
  title: 'Chart/Bar',
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

export const SimpleBar = Template.bind({});
SimpleBar.args = {
  isEnlarged: true,
  viewContent: {
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
  },
};

export const StackedBar = Template.bind({});
StackedBar.args = {
  isEnlarged: true,
  viewContent: {
    ...SimpleBar.args.viewContent,
    chartConfig: {
      value: {
        chartType: 'bar',
        color: '#6ab04c',
        stackId: 'a',
      },
      value2: {
        chartType: 'bar',
        color: '#f0932b',
        stackId: 'a',
      },
    },
  },
};

export const BarReferenceAreas = Template.bind({});
BarReferenceAreas.args = {
  isEnlarged: true,
  viewContent: {
    ...SimpleBar.args.viewContent,
    referenceAreas: [
      {
        key: 1,
        y1: 0.0,
        y2: 0.4,
        stroke: '#eb4d4b',
        fill: '#eb4d4b',
        fillOpacity: 0.5,
        strokeOpacity: 0.5,
      },
      {
        key: 2,
        y1: 0.4,
        y2: 0.6,
        stroke: '#f0932b',
        fill: '#f0932b',
        fillOpacity: 0.5,
        strokeOpacity: 0.5,
      },
      {
        key: 3,
        y1: 0.6,
        y2: 0.8,
        stroke: '#f9ca24',
        fill: '#f9ca24',
        fillOpacity: 0.5,
        strokeOpacity: 0.5,
      },
      {
        key: 4,
        y1: 0.8,
        stroke: '#6ab04c',
        fill: '#6ab04c',
        fillOpacity: 0.5,
        strokeOpacity: 0.5,
      },
    ],
  },
};
