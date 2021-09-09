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
  args: {
    granularity: GRANULARITIES.DAY,
    startDate: null,
    endDate: null,
    isLoading: false,
    onSetDates: () => {},
  },
};

const Template = ({ onSetDates, startDate, endDate, ...args }) => {
  const [selectedStart, setSelectedStart] = useState(startDate);
  const [selectedEnd, setSelectedEnd] = useState(endDate);

  const handleDatesChange = (newStartDate, newEndDate) => {
    setSelectedStart(newStartDate);
    setSelectedEnd(newEndDate);
  };

  return (
    <DateRangePicker
      onSetDates={handleDatesChange}
      startDate={selectedStart}
      endDate={selectedEnd}
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
};

export const SingleWeek = Template.bind({});
SingleWeek.args = {
  granularity: GRANULARITIES.SINGLE_WEEK,
};

export const Month = Template.bind({});
Month.args = {
  granularity: GRANULARITIES.MONTH,
};

export const SingleMonth = Template.bind({});
SingleMonth.args = {
  granularity: GRANULARITIES.SINGLE_MONTH,
};

export const Quarter = Template.bind({});
Quarter.args = {
  granularity: GRANULARITIES.QUARTER,
};

export const SingleQuarter = Template.bind({});
SingleQuarter.args = {
  granularity: GRANULARITIES.SINGLE_QUARTER,
};

export const Year = Template.bind({});
Year.args = {
  granularity: GRANULARITIES.YEAR,
};

export const SingleYear = Template.bind({});
SingleYear.args = {
  granularity: GRANULARITIES.SINGLE_YEAR,
};
