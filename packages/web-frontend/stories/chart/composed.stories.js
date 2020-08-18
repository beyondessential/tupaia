/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { CartesianChart } from '../../src/components/View/ChartWrapper/CartesianChart';
import { CheckboxField } from '../../src/containers/Form/Fields';
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
    chartType: 'composed',
    valueType: 'percentage',
    periodGranularity: 'month',
    chartConfig: {
      value: {
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

const filterableBaseConfig = {
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
  chartType: 'composed',
  valueType: 'percentage',
  periodGranularity: 'month',
};

const Options = styled.div`
  padding: 1rem 3rem;
`;

// Todo: Either refactor Chart component to be controllable or delete this story
export const Filterable = () => {
  const [showLine, setShowLine] = React.useState(false);

  const chartConfig = {
    value1: {
      chartType: 'bar',
      color: '#6ab04c',
      stackId: 'a',
      referenceValue: '0.5',
    },
    value2: {
      chartType: 'bar',
      color: '#f0932b',
      stackId: 'a',
    },
  };

  const lineConfig = {
    value3: {
      chartType: 'line',
      color: '#ffffff',
      referenceValue: '1.1',
    },
  };

  const config = {
    ...filterableBaseConfig,
    chartConfig: { ...chartConfig, ...(showLine && lineConfig) },
  };

  return (
    <Container>
      <Options>
        <CheckboxField
          name="showLine"
          label="Show line"
          onChange={event => {
            setShowLine(event.target.checked);
          }}
          value={showLine}
        />
      </Options>
      <CartesianChart viewContent={config} isEnlarged />
    </Container>
  );
};
