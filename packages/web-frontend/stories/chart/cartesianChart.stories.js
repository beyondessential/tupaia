/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
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
};

export const Cartesian = () => <CartesianChart viewContent={viewContent} isEnlarged />;
