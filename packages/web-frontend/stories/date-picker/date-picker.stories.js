/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { State, Store } from '@sambego/storybook-state';
import { DateRangePicker } from '../../src/components/DateRangePicker';
import {
  GRANULARITIES_WITH_MULTIPLE_DATES,
  GRANULARITIES_WITH_ONE_DATE,
} from '../../src/utils/periodGranularities';

const Container = styled.div`
  margin: 1rem auto;
  width: 400px;
  height: 200px;
  background: rgba(255, 255, 255, 0.02);
`;

export default {
  title: 'FormControl/DateRangePicker',
  component: DateRangePicker,
  decorators: [
    Story => (
      <Container>
        <Story />
      </Container>
    ),
  ],
};

const createDateRangePicker = () => {
  // We use a store to allow the DateRangePicker to change it's own dates
  const store = new Store({});
  return args => (
    <>
      <State store={store}>
        <DateRangePicker
          {...args}
          onSetDates={(startDate, endDate) => store.set({ startDate, endDate })}
        />
      </State>
    </>
  );
};

const multipleDatesDefaults = {
  args: {
    granularity: 'day',
  },
  argTypes: {
    granularity: {
      control: {
        type: 'inline-radio',
        options: GRANULARITIES_WITH_MULTIPLE_DATES,
      },
    },
  },
};

const oneDateDefaults = {
  args: {
    granularity: 'one_day_at_a_time',
  },
  argTypes: {
    granularity: {
      control: {
        type: 'inline-radio',
        options: GRANULARITIES_WITH_ONE_DATE,
      },
    },
  },
};

/*
 * Basic
 */

export const MultipleDates = createDateRangePicker();
MultipleDates.args = multipleDatesDefaults.args;
MultipleDates.argTypes = multipleDatesDefaults.argTypes;

export const OneDate = createDateRangePicker();
OneDate.args = oneDateDefaults.args;
OneDate.argTypes = oneDateDefaults.argTypes;

/*
 * With defaults (initial dates)
 */

export const MultipleDatesWithDefaults = createDateRangePicker();
MultipleDatesWithDefaults.args = {
  ...multipleDatesDefaults.args,
  startDate: '2019-01-01',
  endDate: '2019-01-05',
};
MultipleDatesWithDefaults.argTypes = multipleDatesDefaults.argTypes;

export const OneDateWithDefaults = createDateRangePicker();
OneDateWithDefaults.args = {
  ...oneDateDefaults.args,
  startDate: '2019-01-01',
  endDate: '2019-01-05',
};
OneDateWithDefaults.argTypes = oneDateDefaults.argTypes;
