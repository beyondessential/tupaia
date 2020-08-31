/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { PieChart } from '../../src/components/View/ChartWrapper/PieChart';
import data from './data/pie.json';

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

const Template = args => <PieChart {...args} />;

export const SimplePie = Template.bind({});
SimplePie.args = {
  isEnlarged: true,
  viewContent: {
    data: data,
    viewId: '28',
    organisationUnitCode: 'explore',
    dashboardGroupId: '301',
    name: 'Number of Operational Facilities Surveyed by Country',
    type: 'chart',
    chartType: 'pie',
    valueType: 'text',
  },
};
