/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import moment from 'moment';
import { render } from '../testableRender';
import { DateRangePicker } from '../../components/DateRangePicker';
import { GRANULARITY_CONFIG, GRANULARITIES_WITH_ONE_DATE } from '../../utils/periodGranularities';
import { MIN_DATE_PICKER_DATE } from '../../components/DateRangePicker/constants';

const MIN_MOMENT_DATE = moment(MIN_DATE_PICKER_DATE);
const MAX_MOMENT_DATE = moment();
const START_DATE = '2016-09-23';
const END_DATE = '2018-03-20';

describe('dateRangePicker', () => {
  Object.entries(GRANULARITY_CONFIG).forEach(([key, value]) => {
    it(`can display with default values for ${key} granularity`, () => {
      render(<DateRangePicker granularity={key} />);

      const labelText = screen.getByLabelText('active-date');
      const startDate = MIN_MOMENT_DATE.format(value.rangeFormat);
      const endDate = MAX_MOMENT_DATE.startOf(value.momentUnit).format(value.rangeFormat);

      if (GRANULARITIES_WITH_ONE_DATE.includes(key)) {
        expect(labelText).toHaveTextContent(endDate);
      } else {
        expect(labelText).toHaveTextContent(`${startDate} - ${endDate}`);
      }
    });
  });

  Object.entries(GRANULARITY_CONFIG).forEach(([key, value]) => {
    it(`can display set start and end dates for ${key} granularity`, () => {
      render(<DateRangePicker startDate={START_DATE} endDate={END_DATE} granularity={key} />);

      const labelText = screen.getByLabelText('active-date');
      const startDate = moment(START_DATE).format(value.rangeFormat);
      const endDate = moment(END_DATE)
        .startOf(value.momentUnit)
        .format(value.rangeFormat);

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

  Object.entries(GRANULARITY_CONFIG).forEach(([key, value]) => {
    if (GRANULARITIES_WITH_ONE_DATE.includes(key)) {
      it(`can be reset for ${key} granularity`, () => {
        render(<ControlledDateRangePicker granularity={key} />);

        const labelText = screen.getByLabelText('active-date');
        const prev = screen.getByRole('button', { name: 'prev' });
        const reset = screen.getByRole('button', { name: /reset*/i });

        userEvent.click(prev);
        userEvent.click(prev);
        userEvent.click(reset);

        const endDate = moment(END_DATE)
          .startOf(value.momentUnit)
          .format(value.rangeFormat);
        expect(labelText).toHaveTextContent(endDate);
      });
    }
  });
});
