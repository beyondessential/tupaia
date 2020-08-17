/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { CartesianChart } from '../../src/components/View/ChartWrapper/CartesianChart';

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
  data: [
    {
      name: 'Balwyn',
      value: 0.593,
    },
    {
      name: 'Hawthorn East',
      value: 0.271,
    },
    {
      name: 'Kerang',
      value: 0.61,
    },
    {
      name: 'Lake Charm',
      value: 0.203,
    },
    {
      name: 'Marla',
      value: 0.271,
    },
    {
      name: 'Mont Albert',
      value: 0.492,
    },
    {
      name: 'National Medical Warehouse',
      value: 0.576,
    },
    {
      name: 'Port Douglas',
      value: 0.085,
    },
    {
      name: 'Swan Hill',
      value: 0.254,
    },
    {
      name: 'Thornbury',
      value: 0.322,
    },
  ],
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
};

export const Cartesian = () => <CartesianChart viewContent={viewContent} isEnlarged />;
