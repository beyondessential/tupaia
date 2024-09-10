/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React, { useState } from 'react';
import { Moment } from 'moment';
import { GRANULARITIES, displayStringToMoment } from '@tupaia/utils';
import type { Meta } from '@storybook/react';
import { DateRangePicker } from '../../src/components/DateRangePicker';
import { ValueOf } from '../../src/types';

const meta: Meta<typeof DateRangePicker> = {
  title: 'components/DateRangePicker',
  component: DateRangePicker,
  parameters: {
    backgrounds: {
      default: 'dark',
    },
    theme: 'dark',
  },
  decorators: [
    Story => (
      <div style={{ margin: '1rem', maxWidth: '20rem' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;

const Template = ({
  onSetDates,
  startDate,
  endDate,
  granularity,
  ...args
}: {
  onSetDates: (startDate?: string, endDate?: string) => void;
  startDate?: Moment;
  endDate?: Moment;
  granularity: ValueOf<typeof GRANULARITIES>;
}) => {
  const [selectedStart, setSelectedStart] = useState(startDate);
  const [selectedEnd, setSelectedEnd] = useState(endDate);

  const handleDatesChange = (newStartDate: string, newEndDate: string) => {
    setSelectedStart(displayStringToMoment(newStartDate));
    setSelectedEnd(displayStringToMoment(newEndDate));
  };

  return (
    <DateRangePicker
      onSetDates={handleDatesChange}
      startDate={selectedStart}
      endDate={selectedEnd}
      granularity={granularity}
      onResetDate={() => {}}
      {...args}
    />
  );
};

export const Day = {
  render: () => <Template onSetDates={() => {}} granularity={GRANULARITIES.DAY} />,
};

export const SingleDay = {
  render: () => <Template onSetDates={() => {}} granularity={GRANULARITIES.SINGLE_DAY} />,
};

export const Week = {
  render: () => <Template onSetDates={() => {}} granularity={GRANULARITIES.WEEK} />,
};

export const SingleWeek = {
  render: () => <Template onSetDates={() => {}} granularity={GRANULARITIES.SINGLE_WEEK} />,
};

export const Month = {
  render: () => <Template onSetDates={() => {}} granularity={GRANULARITIES.MONTH} />,
};

export const SingleMonth = {
  render: () => <Template onSetDates={() => {}} granularity={GRANULARITIES.SINGLE_MONTH} />,
};

export const Quarter = {
  render: () => <Template onSetDates={() => {}} granularity={GRANULARITIES.QUARTER} />,
};

export const SingleQuarter = {
  render: () => <Template onSetDates={() => {}} granularity={GRANULARITIES.SINGLE_QUARTER} />,
};

export const Year = {
  render: () => <Template onSetDates={() => {}} granularity={GRANULARITIES.QUARTER} />,
};

export const SingleYear = {
  render: () => <Template onSetDates={() => {}} granularity={GRANULARITIES.SINGLE_YEAR} />,
};
