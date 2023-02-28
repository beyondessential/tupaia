/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { State, Store } from '@sambego/storybook-state';
import moment from 'moment';
import { forceReRender } from '@storybook/react';
import Grid from '@material-ui/core/Grid';
import { DateRangePicker } from '../../src/components/DateRangePicker';
import {
  GRANULARITIES_WITH_MULTIPLE_DATES,
  GRANULARITIES_WITH_ONE_DATE,
} from '../../src/utils/periodGranularities';

export default {
  title: 'FormControl/DateRangePicker',
  component: DateRangePicker,
};

const createDateRangePicker = state => {
  // We use a store to allow the DateRangePicker to change it's own dates
  const initialState = {
    startDate: null,
    endDate: null,
    ...state,
  };
  const store = new Store(initialState);
  // force re-render after changing start/end dates or resetting, because we may have changed granularity
  // and the component needs to re-initialise
  store.subscribe(() => {
    forceReRender();
  });
  const StateDebugPanel = () => (
    <div style={{ backgroundColor: 'lightyellow', padding: '1rem' }}>
      State for this story:
      <pre>
        <em>startDate: </em>
        {store.get('startDate') ? moment(store.get('startDate')).format() : ''}
        <br />
        <em>endDate:{'   '}</em>
        {store.get('endDate') ? moment(store.get('endDate')).format() : ''}
      </pre>
      <div>
        <button type="button" onClick={() => store.set(initialState)}>
          Reset
        </button>
      </div>
      <small>(reset needed after changing granularity in controls)</small>
    </div>
  );
  return args => (
    <>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <State store={store}>
            <DateRangePicker
              {...args}
              onSetDates={(startDate, endDate) => store.set({ startDate, endDate })}
            />
          </State>
        </Grid>
        <Grid item xs={6}>
          <StateDebugPanel />
        </Grid>
      </Grid>
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

export const MultipleDates = createDateRangePicker({});
MultipleDates.args = multipleDatesDefaults.args;
MultipleDates.argTypes = multipleDatesDefaults.argTypes;

export const OneDate = createDateRangePicker({});
OneDate.args = oneDateDefaults.args;
OneDate.argTypes = oneDateDefaults.argTypes;

/*
 * With defaults (initial dates)
 */

export const MultipleDatesWithDefaults = createDateRangePicker({
  startDate: '2019-01-01',
  endDate: '2019-01-05',
});
MultipleDatesWithDefaults.args = multipleDatesDefaults.args;
MultipleDatesWithDefaults.argTypes = multipleDatesDefaults.argTypes;

export const OneDateWithDefaults = createDateRangePicker({
  startDate: '2019-01-01',
  endDate: '2019-01-05',
});
OneDateWithDefaults.args = {
  ...oneDateDefaults.args,
};
OneDateWithDefaults.argTypes = oneDateDefaults.argTypes;

/*
 * With limits
 */

export const MultipleDatesWithLimits = createDateRangePicker({});
MultipleDatesWithLimits.args = {
  ...multipleDatesDefaults.args,
  min: '2019-02-02',
  max: '2019-05-05',
};
MultipleDatesWithLimits.argTypes = multipleDatesDefaults.argTypes;

export const OneDateWithLimits = createDateRangePicker({});
OneDateWithLimits.args = {
  ...oneDateDefaults.args,
  granularity: 'one_week_at_a_time',
  min: '2019-02-02',
  max: '2019-05-05',
};
OneDateWithLimits.argTypes = oneDateDefaults.argTypes;
