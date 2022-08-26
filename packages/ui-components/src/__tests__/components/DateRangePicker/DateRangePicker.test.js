/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */

import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import moment from 'moment';
import { render } from '../../../../helpers/testingRenderer';
import { DateRangePicker } from '../../../components/DateRangePicker';
import {
  DEFAULT_MIN_DATE,
  GRANULARITY_CONFIG,
  GRANULARITIES_WITH_ONE_DATE,
  momentToDateString,
  GRANULARITIES,
} from '../../../components/Chart/periodGranularities';

const MAX_MOMENT_DATE = moment();

const START_DATE = '2016-09-23';
const END_DATE = '2018-03-20';

const MIN_MOMENT_STRINGS = {
  [GRANULARITIES.DAY]: '1st Jan 2015',
  [GRANULARITIES.SINGLE_DAY]: '1st Jan 2015',
  [GRANULARITIES.WEEK]: 'W/C 29 Dec 2014',
  [GRANULARITIES.SINGLE_WEEK]: 'W/C 29 Dec 2014',
  [GRANULARITIES.MONTH]: 'Jan 2015',
  [GRANULARITIES.SINGLE_MONTH]: 'Jan 2015',
  [GRANULARITIES.QUARTER]: 'Q1 2015',
  [GRANULARITIES.SINGLE_QUARTER]: 'Q1 2015',
  [GRANULARITIES.YEAR]: '2015',
  [GRANULARITIES.SINGLE_YEAR]: '2015',
};

const TEST_START_DATE_STRINGS = {
  [GRANULARITIES.DAY]: '23rd Sep 2016',
  [GRANULARITIES.SINGLE_DAY]: '23rd Sep 2016',
  [GRANULARITIES.WEEK]: 'W/C 19 Sep 2016',
  [GRANULARITIES.SINGLE_WEEK]: 'W/C 19 Sep 2016',
  [GRANULARITIES.MONTH]: 'Sep 2016',
  [GRANULARITIES.SINGLE_MONTH]: 'Sep 2016',
  [GRANULARITIES.QUARTER]: 'Q3 2016',
  [GRANULARITIES.SINGLE_QUARTER]: 'Q3 2016',
  [GRANULARITIES.YEAR]: '2016',
  [GRANULARITIES.SINGLE_YEAR]: '2016',
};

const TEST_END_DATE_STRINGS = {
  [GRANULARITIES.DAY]: '20th Mar 2018',
  [GRANULARITIES.SINGLE_DAY]: '20th Mar 2018',
  [GRANULARITIES.WEEK]: 'W/C 19 Mar 2018',
  [GRANULARITIES.SINGLE_WEEK]: 'W/C 19 Mar 2018',
  [GRANULARITIES.MONTH]: 'Mar 2018',
  [GRANULARITIES.SINGLE_MONTH]: 'Mar 2018',
  [GRANULARITIES.QUARTER]: 'Q1 2018',
  [GRANULARITIES.SINGLE_QUARTER]: 'Q1 2018',
  [GRANULARITIES.YEAR]: '2018',
  [GRANULARITIES.SINGLE_YEAR]: '2018',
};

describe('dateRangePicker', () => {
  it('Has a DEFAULT_MIN_DATE consistent with tests', () => {
    expect(DEFAULT_MIN_DATE).toBe('20150101');
  });

  Object.entries(GRANULARITY_CONFIG).forEach(([key, value]) => {
    it(`can display with default values for ${key} granularity`, () => {
      render(<DateRangePicker granularity={key} />);

      const labelText = screen.getByLabelText('active-date');
      const startDate = MIN_MOMENT_STRINGS[key];
      const endDate = momentToDateString(MAX_MOMENT_DATE, key, value.rangeFormat);

      if (GRANULARITIES_WITH_ONE_DATE.includes(key)) {
        expect(labelText).toHaveTextContent(endDate);
      } else {
        expect(labelText).toHaveTextContent(`${startDate} - ${endDate}`);
      }
    });
  });

  Object.keys(GRANULARITY_CONFIG).forEach(key => {
    it(`can display set start and end dates for ${key} granularity`, () => {
      render(<DateRangePicker startDate={START_DATE} endDate={END_DATE} granularity={key} />);

      const labelText = screen.getByLabelText('active-date');
      const startDate = TEST_START_DATE_STRINGS[key];
      const endDate = TEST_END_DATE_STRINGS[key];

      if (GRANULARITIES_WITH_ONE_DATE.includes(key)) {
        expect(labelText).toHaveTextContent(endDate);
      } else {
        expect(labelText).toHaveTextContent(`${startDate} - ${endDate}`);
      }
    });
  });
});

const ControlledDateRangePicker = ({ granularity }) => {
  const [startDate, setStartDate] = React.useState(START_DATE);
  const [endDate, setEndDate] = React.useState(END_DATE);

  const handleUpdate = (start, end) => {
    setStartDate(start);
    setEndDate(end);
  };

  return (
    <DateRangePicker
      startDate={startDate}
      endDate={endDate}
      granularity={granularity}
      onSetDates={handleUpdate}
    />
  );
};

describe('controlled dateRangePicker', () => {
  Object.entries(GRANULARITY_CONFIG).forEach(([key, value]) => {
    if (GRANULARITIES_WITH_ONE_DATE.includes(key)) {
      it(`can click to increase and decrease dates for ${key} granularity`, () => {
        render(<ControlledDateRangePicker granularity={key} />);

        const labelText = screen.getByLabelText('active-date');
        const prev = screen.getByRole('button', { name: 'prev' });
        const next = screen.getByRole('button', { name: 'next' });

        userEvent.click(prev);

        const prevEndDate = moment(END_DATE)
          .add(-1, value.momentShorthand)
          .startOf(value.momentUnit)
          .format(value.rangeFormat);

        expect(labelText).toHaveTextContent(prevEndDate);

        userEvent.click(next);
        userEvent.click(next);

        const nextEndDate = moment(END_DATE)
          .add(1, value.momentShorthand)
          .startOf(value.momentUnit)
          .format(value.rangeFormat);

        expect(labelText).toHaveTextContent(nextEndDate);
      });
    }
  });
});
