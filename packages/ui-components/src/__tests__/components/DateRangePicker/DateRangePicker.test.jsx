import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import moment from 'moment';
import {
  DEFAULT_MIN_DATE,
  GRANULARITIES,
  GRANULARITIES_WITH_ONE_DATE,
  GRANULARITY_CONFIG,
  momentToDateDisplayString,
} from '@tupaia/utils';
import { render } from '../../../../helpers/testingRenderer';
import { DateRangePicker } from '../../../components';

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
      const endDate = momentToDateDisplayString(MAX_MOMENT_DATE, key, value.rangeFormat);

      if (GRANULARITIES_WITH_ONE_DATE.includes(key)) {
        expect(labelText).toHaveTextContent(endDate);
      } else {
        expect(labelText).toHaveTextContent(`${startDate} – ${endDate}`); // En dash
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
        expect(labelText).toHaveTextContent(`${startDate} – ${endDate}`); // En dash
      }
    });
  });
  it('can display set start and end dates for year granularity when there is an offset', () => {
    const initialEndDate = '2019-06-30';
    const initialStartDate = '2017-07-01';
    render(
      <DateRangePicker
        startDate={initialStartDate}
        endDate={initialEndDate}
        granularity="year"
        dateOffset={{
          offset: 2,
          unit: 'quarter',
        }}
      />,
    );

    const labelText = screen.getByLabelText('active-date');

    expect(labelText).toHaveTextContent('Q3 2017 – Q2 2019');
  });

  it('can display set start and end dates for single year granularity when there is an offset and a date range delimiter', () => {
    const initialEndDate = '2018-06-30';
    const initialStartDate = '2017-07-01';
    render(
      <DateRangePicker
        startDate={initialStartDate}
        endDate={initialEndDate}
        granularity="one_year_at_a_time"
        dateOffset={{
          offset: 2,
          unit: 'quarter',
        }}
        dateRangeDelimiter="/"
      />,
    );

    const labelText = screen.getByLabelText('active-date');

    expect(labelText).toHaveTextContent('Q3 2017/Q2 2018');
  });
});
// make this the same by default because this is always going to be a single date type
const ControlledDateRangePicker = ({
  granularity,
  initialEndDate = END_DATE,
  initialStartDate = END_DATE,
  dateOffset,
}) => {
  const [startDate, setStartDate] = React.useState(initialStartDate);
  const [endDate, setEndDate] = React.useState(initialEndDate);

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
      dateOffset={dateOffset}
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

        const prevEndDate = momentToDateDisplayString(
          moment(END_DATE).add(-1, value.momentShorthand).endOf(value.momentUnit),
          key,
          value.rangeFormat,
          value.modifier,
        );

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
  it('can click to increase and decrease dates for single year granularity when an offset is applied', () => {
    const initialEndDate = '2018-06-30';
    const initialStartDate = '2017-07-01';
    render(
      <ControlledDateRangePicker
        granularity="one_year_at_a_time"
        initialEndDate={initialEndDate}
        initialStartDate={initialStartDate}
        dateOffset={{
          offset: 6,
          unit: 'month',
        }}
      />,
    );

    const labelText = screen.getByLabelText('active-date');
    const prev = screen.getByRole('button', { name: 'prev' });
    const next = screen.getByRole('button', { name: 'next' });

    userEvent.click(prev);

    expect(labelText).toHaveTextContent('Jul 2016 – Jun 2017');

    userEvent.click(next);
    userEvent.click(next);

    expect(labelText).toHaveTextContent('Jul 2018 – Jun 2019');
  });
});
