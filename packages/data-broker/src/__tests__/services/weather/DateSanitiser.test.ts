import { DateSanitiser } from '../../../services/weather/DateSanitiser';
import { mockNow } from './testutil';

interface DateRange {
  startDate?: string | null;
  endDate?: string | null;
}

type TestData = [string, (string | undefined)[], (string | undefined | null)[]][];

/*
 * Note 1:
 *  - for WeatherBit API, end date today means at 00:00:01 today, which does not cover any weather data for today
 */
describe('DateSanitiser', () => {
  const assertHistoricDateRangeIsCorrectlySanitised = (
    dateRange: { startDate?: string; endDate?: string },
    expected: DateRange,
  ) => {
    expect(
      new DateSanitiser().sanitiseHistoricDateRange(dateRange.startDate, dateRange.endDate),
    ).toStrictEqual(expected);
  };

  beforeEach(() => {
    mockNow(1549360800 * 1000); // (2019-02-05 10:00 UTC)
  });

  describe('invalid dates', () => {
    it('throws when start > end', () => {
      const functionCall = () =>
        new DateSanitiser().sanitiseHistoricDateRange('2019-01-20', '2019-01-10');
      expect(functionCall).toThrowError('Start date must be before (or equal to) end date');
    });
  });

  describe('exclusive end dates', () => {
    // (See note 1) same as input, changed to be exclusive end date
    const testData: TestData = [
      [
        'gives a midnight-midnight range when a single date is provided',
        ['2019-01-05', '2019-01-05'],
        // endDate same as input, changed to be exclusive (See note 1)
        ['2019-01-05', '2019-01-06'],
      ],
      [
        'considers end date as inclusive when given a date range',
        ['2019-01-03', '2019-01-05'],
        // endDate same as input, changed to be exclusive (See note 1)
        ['2019-01-03', '2019-01-06'],
      ],
    ];

    it.each(testData)('%s', (_, [startDate, endDate], [expectedStartDate, expectedEndDate]) => {
      assertHistoricDateRangeIsCorrectlySanitised(
        { startDate, endDate },
        { startDate: expectedStartDate, endDate: expectedEndDate },
      );
    });
  });

  describe('historic', () => {
    describe('default date range', () => {
      const testData: TestData = [
        ['defaults to full range', [undefined, undefined], ['2018-02-05', '2019-02-05']],
      ];

      it.each(testData)('%s', (_, [startDate, endDate], [expectedStartDate, expectedEndDate]) => {
        assertHistoricDateRangeIsCorrectlySanitised(
          { startDate, endDate },
          { startDate: expectedStartDate, endDate: expectedEndDate },
        );
      });
    });

    describe('limits on earliest data', () => {
      /*
       * This is a limitation of the WeatherBit plan we use, if we request further back it falls over
       */
      const testData: TestData = [
        [
          'only start date is before the earliest available data',
          ['2017-02-10', '2019-01-01'],
          // Start date is the earliest date. End date is same as input, changed to be exclusive
          ['2018-02-05', '2019-01-02'],
        ],
        [
          'returns null when both start and end dates are before the earliest available data',
          ['2017-02-10', '2017-02-20'],
          [null, null],
        ],
      ];

      it.each(testData)('%s', (_, [startDate, endDate], [expectedStartDate, expectedEndDate]) => {
        assertHistoricDateRangeIsCorrectlySanitised(
          { startDate, endDate },
          { startDate: expectedStartDate, endDate: expectedEndDate },
        );
      });
    });

    describe('limits on latest data', () => {
      /*
       * Today's data is incomplete, e.g. we don't know the total rainfall for the day until
       * the day is over. So we cannot return data for today. For today's data we need to use the forecast API.
       */
      const testData: TestData = [
        [
          'only end date is after the latest available data',
          ['2019-01-02', '2019-07-20'],
          // End date is the latest date
          ['2019-01-02', '2019-02-05'],
        ],
        [
          'only end date is after latest, start date is already latest',
          ['2019-02-04', '2019-07-20'],
          // Start date is same as input, latest - 1 day. End date is the latest date
          ['2019-02-04', '2019-02-05'],
        ],
        [
          'returns null when both start and end dates are after the latest available data',
          ['2019-07-10', '2019-07-20'],
          [null, null],
        ],
        ["request for today's data returns null", ['2019-02-05', '2019-02-05'], [null, null]],
      ];

      it.each(testData)('%s', (_, [startDate, endDate], [expectedStartDate, expectedEndDate]) => {
        assertHistoricDateRangeIsCorrectlySanitised(
          { startDate, endDate },
          { startDate: expectedStartDate, endDate: expectedEndDate },
        );
      });
    });
  });
});
