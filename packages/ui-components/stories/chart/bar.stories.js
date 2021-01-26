/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { CartesianChart } from '../../src';
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
  data,
  config: {
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
