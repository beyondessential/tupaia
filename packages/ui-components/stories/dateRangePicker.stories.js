/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { DateRangePicker } from '../src';
import barViewJson from './chart/data/barChartViewContent.json';
import composedViewJson from './chart/data/composedChartViewContent.json';
import lineViewJson from './chart/data/lineChartViewContent.json';
import pieViewJson from './chart/data/pieChartViewContent.json';
import stackedViewJson from './chart/data/stackedBarChart.json';

export default {
  title: 'DateRangePicker',
};

const Container = styled.div`
  padding: 1rem;
  background: black;
`;

export const SimpleDateRangePicker = () => {
  const { startDate, endDate, periodGranularity } = barViewJson;

  return (
    <Container>
      <DateRangePicker granularity={periodGranularity} startDate={startDate} endDate={endDate} />
    </Container>
  );
};
