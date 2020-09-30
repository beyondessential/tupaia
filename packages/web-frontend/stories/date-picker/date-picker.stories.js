/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { DateRangePicker } from '../../src/components/DateRangePicker';
import {
  GRANULARITIES,
  GRANULARITIES_WITH_MULTIPLE_DATES,
  GRANULARITIES_WITH_ONE_DATE,
} from '../../src/utils/periodGranularities';

export default {
  title: 'FormControl/DateRangePicker',
  component: DateRangePicker,
};

/*
 * Basic
 */

export const MultipleDates = args => <DateRangePicker {...args} />;

MultipleDates.args = {
  granularity: 'day',
};

MultipleDates.argTypes = {
  granularity: {
    control: {
      type: 'inline-radio',
      options: GRANULARITIES_WITH_MULTIPLE_DATES,
    },
  },
};

export const OneDate = args => <DateRangePicker {...args} />;

OneDate.args = {
  granularity: 'one_day_at_a_time',
};

OneDate.argTypes = {
  granularity: {
    control: {
      type: 'inline-radio',
      options: GRANULARITIES_WITH_ONE_DATE,
    },
  },
};

/*
 * With defaults (initial dates)
 */

export const MultipleDatesWithDefaults = args => <DateRangePicker {...args} />;

MultipleDatesWithDefaults.args = {
  startDate: '2020-01-01',
  endDate: '2020-01-05',
  granularity: 'day',
};

MultipleDatesWithDefaults.argTypes = {
  granularity: {
    control: {
      type: 'inline-radio',
      options: GRANULARITIES_WITH_MULTIPLE_DATES,
    },
  },
};

export const OneDateWithDefaults = args => <DateRangePicker {...args} />;

OneDateWithDefaults.args = {
  startDate: '2020-01-01',
  endDate: '2020-01-05',
  granularity: 'one_day_at_a_time',
};

OneDateWithDefaults.argTypes = {
  granularity: {
    control: {
      type: 'inline-radio',
      options: GRANULARITIES_WITH_ONE_DATE,
    },
  },
};
