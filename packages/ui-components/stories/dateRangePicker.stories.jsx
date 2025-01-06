/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { Table, TableBody, TableCell, TableHead, TableRow } from '@material-ui/core';
import { WEEK_DISPLAY_FORMATS, GRANULARITIES } from '@tupaia/utils';
import { DateRangePicker } from '../src/components/DateRangePicker';

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

export const WeekFormat = () => (
  <>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Format</TableCell>
          <TableCell>Single Week</TableCell>
          <TableCell>Date Range</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {Object.values(WEEK_DISPLAY_FORMATS).map(format => (
          <TableRow>
            <TableCell>
              <strong>{format}</strong>
            </TableCell>
            <TableCell>
              <Template granularity={GRANULARITIES.SINGLE_WEEK} weekDisplayFormat={format} />
            </TableCell>
            <TableCell>
              <Template granularity={GRANULARITIES.WEEK} weekDisplayFormat={format} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </>
);
