import { expect } from 'chai';
import { DateSanitiser } from '../../../services/weather/DateSanitiser';
import { mockNow, resetMocks } from './testutil';

describe('DateSanitiser', () => {
  beforeEach(() => {
    mockNow(1549360800 * 1000); // (2019-02-05 10:00 UTC)
  });

  afterEach(() => {
    resetMocks();
  });

  it('throws when start > end', () => {
    const functionCall = () => new DateSanitiser().sanitise('2019-01-20', '2019-01-10');
    expect(functionCall).to.throw('Start date must be before (or equal to) end date');
  });

  describe('limits on earliest data', () => {
    /*
     * This is a limitation of the WeatherBit plan we use, if we request further back it falls over
     */

    it('both start and end dates are before the earliest available data', () => {
      const { startDate: actualStartDate, endDate: actualEndDate } = new DateSanitiser().sanitise(
        '2017-02-10',
        '2017-02-20',
      );

      expect(actualStartDate).to.equal('2018-02-05'); // earliest date
      expect(actualEndDate).to.equal('2018-02-06'); // earliest + 1 day
    });

    it('only start date is before the earliest available data', () => {
      const { startDate: actualStartDate, endDate: actualEndDate } = new DateSanitiser().sanitise(
        '2017-02-10',
        '2019-01-01',
      );

      expect(actualStartDate).to.equal('2018-02-05'); // earliest date
      expect(actualEndDate).to.equal('2019-01-01');
    });

    it('only start date is before earliest, end date is already earliest', () => {
      const { startDate: actualStartDate, endDate: actualEndDate } = new DateSanitiser().sanitise(
        '2017-02-10',
        '2018-02-06',
      );

      expect(actualStartDate).to.equal('2018-02-05'); // earliest date
      expect(actualEndDate).to.equal('2018-02-06'); // (same as input) earliest + 1 day
    });
  });

  describe('limits on latest data', () => {
    /*
     * Today's data is incomplete, e.g. we don't know the total rainfall for the day until
     * the day is over. So we cannot return data for today, instead we return data for yesterday.
     *
     * There may be a possibility of using the forecast API to get today's forecast max temp / precip,
     * but this will be covered by #1250
     *
     * Note for latest available dates:
     *  - for WeatherBit API, end date today means at 00:00:01 today, which does not cover any weather data for today
     */

    it('both start and end dates are after the latest available data', () => {
      const { startDate: actualStartDate, endDate: actualEndDate } = new DateSanitiser().sanitise(
        '2019-07-10',
        '2019-07-20',
      );

      expect(actualStartDate).to.equal('2019-02-04'); // latest - 1 day
      expect(actualEndDate).to.equal('2019-02-05'); // latest date
    });

    it('only end date is after the latest available data', () => {
      const { startDate: actualStartDate, endDate: actualEndDate } = new DateSanitiser().sanitise(
        '2019-01-02',
        '2019-07-20',
      );

      expect(actualStartDate).to.equal('2019-01-02');
      expect(actualEndDate).to.equal('2019-02-05'); // latest date
    });

    it('only end date is after latest, start date is already latest', () => {
      const { startDate: actualStartDate, endDate: actualEndDate } = new DateSanitiser().sanitise(
        '2019-02-04',
        '2019-07-20',
      );

      expect(actualStartDate).to.equal('2019-02-04'); // (same as input) latest - 1 day
      expect(actualEndDate).to.equal('2019-02-05'); // latest date
    });
  });

  describe('single day requested', () => {
    /*
     * Note, as above:
     *  - for WeatherBit API, end date today means at 00:00:01 today, which does not cover any weather data for today
     */
    it('gives a midnight-midnight range when a single date is provided', () => {
      const { startDate: actualStartDate, endDate: actualEndDate } = new DateSanitiser().sanitise(
        '2019-01-05',
        '2019-01-05',
      );

      expect(actualStartDate).to.equal('2019-01-05');
      expect(actualEndDate).to.equal('2019-01-06'); // pushed out
    });

    it('does not push end date beyond the latest available data limit', () => {
      const { startDate: actualStartDate, endDate: actualEndDate } = new DateSanitiser().sanitise(
        '2019-02-05',
        '2019-02-05',
      );

      expect(actualStartDate).to.equal('2019-02-04'); // pushed back
      expect(actualEndDate).to.equal('2019-02-05'); // latest date
    });
  });
});
