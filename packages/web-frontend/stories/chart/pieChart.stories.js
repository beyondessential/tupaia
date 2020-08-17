/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { PieChart } from '../../src/components/View/ChartWrapper/PieChart';

const Container = styled.div`
  margin: 1rem auto;
  width: 600px;
  height: 400px;
`;

export default {
  title: 'Chart/Pie',
  component: PieChart,
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
      name: 'Cook Islands',
      value: 5,
    },
    {
      name: 'Kiribati',
      value: 112,
    },
    {
      name: 'Solomon Islands',
      value: 295,
    },
    {
      name: 'Tokelau',
      value: 3,
    },
    {
      name: 'Tonga',
      value: 32,
    },
    {
      name: 'Vanuatu',
      value: 147,
    },
    {
      name: 'Venezuela',
      value: 66,
    },
  ],
  viewId: '28',
  organisationUnitCode: 'explore',
  dashboardGroupId: '301',
  name: 'Number of Operational Facilities Surveyed by Country',
  type: 'chart',
  chartType: 'pie',
  valueType: 'text',
};

export const Pie = () => <PieChart viewContent={viewContent} isEnlarged />;
