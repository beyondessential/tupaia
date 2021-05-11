/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { DateRangePicker } from '../src';
import { GRANULARITIES } from '../src/components/Chart';

const Container = styled.div`
  padding: 1rem;
`;

export default {
  title: 'DateRangePicker',
  component: DateRangePicker,
  decorators: [story => <Container>{story()}</Container>],
};

const Template = args => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const handleDatesChange = (start, end) => {
    setStartDate(start);
    setEndDate(end);
  };

  return (
    <DateRangePicker
      onSetDates={handleDatesChange}
      startDate={startDate}
      endDate={endDate}
      {...args}
    />
  );
};

export const Day = Template.bind({});
Day.args = {
  granularity: GRANULARITIES.DAY,
};

export const SingleDay = Template.bind({});
SingleDay.args = {
  granularity: GRANULARITIES.SINGLE_DAY,
};

export const Week = Template.bind({});
Week.args = {
  granularity: GRANULARITIES.WEEK,
  startDate: '2015-01-01',
  endDate: '2021-04-26',
};

export const SingleWeek = Template.bind({});
SingleWeek.args = {
  granularity: GRANULARITIES.SINGLE_WEEK,
  startDate: '2015-01-01',
  endDate: '2021-04-26',
};

export const Month = Template.bind({});
Month.args = {
  granularity: GRANULARITIES.MONTH,
  startDate: '2015-01-01',
  endDate: '2021-04-26',
};

export const SingleMonth = Template.bind({});
SingleMonth.args = {
  granularity: GRANULARITIES.SINGLE_MONTH,
  startDate: '2015-01-01',
  endDate: '2021-04-26',
};

export const Quarter = Template.bind({});
Quarter.args = {
  granularity: GRANULARITIES.QUARTER,
  startDate: '2015-01-01',
  endDate: '2021-04-26',
};

export const SingleQuarter = Template.bind({});
SingleQuarter.args = {
  granularity: GRANULARITIES.SINGLE_QUARTER,
  startDate: '2015-01-01',
  endDate: '2021-04-26',
};

export const Year = Template.bind({});
Year.args = {
  granularity: GRANULARITIES.YEAR,
  startDate: '2015-01-01',
  endDate: '2021-04-26',
};

export const SingleYear = Template.bind({});
SingleYear.args = {
  granularity: GRANULARITIES.SINGLE_YEAR,
  startDate: '2015-01-01',
  endDate: '2021-04-26',
};
