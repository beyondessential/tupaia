/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import moment from 'moment';
import { render } from '../testableRender';
import { DateRangePicker } from '../../components/DateRangePicker';
import {
  GRANULARITIES,
  GRANULARITY_CONFIG,
  GRANULARITIES_WITH_ONE_DATE,
} from '../../utils/periodGranularities';
import { MIN_DATE_PICKER_DATE } from '../../components/DateRangePicker/constants';

const minMomentDate = moment(MIN_DATE_PICKER_DATE);
const maxMomentDate = moment();

describe('dateRangePicker', () => {
  for (let [key, value] of Object.entries(GRANULARITY_CONFIG)) {
    it(`can display with default values for ${key} granularity`, () => {
      render(<DateRangePicker granularity={key} />);

      const labelText = screen.getByLabelText('active-date');
      const startDate = minMomentDate.format(value.rangeFormat);
      const endDate = maxMomentDate.startOf(value.momentUnit).format(value.rangeFormat);

      if (GRANULARITIES_WITH_ONE_DATE.includes(key)) {
        expect(labelText).toHaveTextContent(endDate);
      } else {
        expect(labelText).toHaveTextContent(`${startDate} - ${endDate}`);
      }
    });
  }

  for (let [key, value] of Object.entries(GRANULARITY_CONFIG)) {
    it(`can display set start and end dates for ${key} granularity`, () => {
      render(<DateRangePicker startDate="2016-09-23" endDate="2018-03-20" granularity={key} />);

      const labelText = screen.getByLabelText('active-date');
      const startDate = moment('2016-09-23').format(value.rangeFormat);
      const endDate = moment('2018-03-20')
        .startOf(value.momentUnit)
        .format(value.rangeFormat);

      if (GRANULARITIES_WITH_ONE_DATE.includes(key)) {
        expect(labelText).toHaveTextContent(endDate);
      } else {
        expect(labelText).toHaveTextContent(`${startDate} - ${endDate}`);
      }
    });
  }
});

const ControlledDateRangePicker = ({ granularity }) => {
  const [startDate, setStartDate] = React.useState('2016-09-23');
  const [endDate, setEndDate] = React.useState('2018-03-20');

  const handleUpdate = (startDate, endDate) => {
    setStartDate(startDate);
    setEndDate(endDate);
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
  for (let [key, value] of Object.entries(GRANULARITY_CONFIG)) {
    if (GRANULARITIES_WITH_ONE_DATE.includes(key)) {
      it(`can click to increase and decrease dates for ${key} granularity`, () => {
        render(<ControlledDateRangePicker granularity={key} />);

        const labelText = screen.getByLabelText('active-date');
        const prev = screen.getByRole('button', { name: 'prev' });
        const next = screen.getByRole('button', { name: 'next' });

        userEvent.click(prev);

        const prevEndDate = moment('2018-03-20')
          .add(-1, value.momentShorthand)
          .startOf(value.momentUnit)
          .format(value.rangeFormat);

        expect(labelText).toHaveTextContent(prevEndDate);

        userEvent.click(next);
        userEvent.click(next);

        const nextEndDate = moment('2018-03-20')
        .add(1, value.momentShorthand)
        .startOf(value.momentUnit)
        .format(value.rangeFormat);

        expect(labelText).toHaveTextContent(nextEndDate);
      });
    }
  }

  test.todo('reset button');
});
