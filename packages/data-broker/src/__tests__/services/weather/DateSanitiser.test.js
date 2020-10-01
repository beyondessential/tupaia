import { expect } from 'chai';
import { DateSanitiser } from '../../../services/weather/DateSanitiser';
import { mockNow, resetMocks } from './testutil';

/*
 * Note 1:
 *  - for WeatherBit API, end date today means at 00:00:01 today, which does not cover any weather data for today
 */
describe('DateSanitiser', () => {
  beforeEach(() => {
    mockNow(1549360800 * 1000); // (2019-02-05 10:00 UTC)
  });

  afterEach(() => {
    resetMocks();
  });

  describe('invalid dates', () => {
    it('throws when start > end', () => {
      const functionCall = () =>
        new DateSanitiser().sanitiseHistoricDateRange('2019-01-20', '2019-01-10');
      expect(functionCall).to.throw('Start date must be before (or equal to) end date');
    });
  });

  describe('exclusive end date', () => {
    it('gives a midnight-midnight range when a single date is provided', () => {
      const {
        startDate: actualStartDate,
        endDate: actualEndDate,
      } = new DateSanitiser().sanitiseHistoricDateRange('2019-01-05', '2019-01-05');

      expect(actualStartDate).to.equal('2019-01-05');
      expect(actualEndDate).to.equal('2019-01-06'); // (See note 1) same as input, changed to be exclusive end date
    });

    it('considers end date as inclusive when given a date range', () => {
      const {
        startDate: actualStartDate,
        endDate: actualEndDate,
      } = new DateSanitiser().sanitiseHistoricDateRange('2019-01-03', '2019-01-05');

      expect(actualStartDate).to.equal('2019-01-03');
      expect(actualEndDate).to.equal('2019-01-06'); // (See note 1) same as input, changed to be exclusive end date
    });
  });

  describe('historic', () => {
    describe('default date range', () => {
      it('defaults to full range', () => {
        const {
          startDate: actualStartDate,
          endDate: actualEndDate,
        } = new DateSanitiser().sanitiseHistoricDateRange(undefined, undefined);

        expect(actualStartDate).to.equal('2018-02-05');
        expect(actualEndDate).to.equal('2019-02-05');
      });
    });

    describe('limits on earliest data', () => {
      /*
       * This is a limitation of the WeatherBit plan we use, if we request further back it falls over
       */

      it('only start date is before the earliest available data', () => {
        const {
          startDate: actualStartDate,
          endDate: actualEndDate,
        } = new DateSanitiser().sanitiseHistoricDateRange('2017-02-10', '2019-01-01');

        expect(actualStartDate).to.equal('2018-02-05'); // earliest date
        expect(actualEndDate).to.equal('2019-01-02'); // (same as input, changed to be exclusive end date)
      });

      it('returns null when both start and end dates are before the earliest available data', () => {
        const {
          startDate: actualStartDate,
          endDate: actualEndDate,
        } = new DateSanitiser().sanitiseHistoricDateRange('2017-02-10', '2017-02-20');

        expect(actualStartDate).to.be.null;
        expect(actualEndDate).to.be.null;
      });
    });

    describe('limits on latest data', () => {
      /*
       * Today's data is incomplete, e.g. we don't know the total rainfall for the day until
       * the day is over. So we cannot return data for today. For today's data we need to use the forecast API.
       */

      it('only end date is after the latest available data', () => {
        const {
          startDate: actualStartDate,
          endDate: actualEndDate,
        } = new DateSanitiser().sanitiseHistoricDateRange('2019-01-02', '2019-07-20');

        expect(actualStartDate).to.equal('2019-01-02');
        expect(actualEndDate).to.equal('2019-02-05'); // latest date
      });

      it('only end date is after latest, start date is already latest', () => {
        const {
          startDate: actualStartDate,
          endDate: actualEndDate,
        } = new DateSanitiser().sanitiseHistoricDateRange('2019-02-04', '2019-07-20');

        expect(actualStartDate).to.equal('2019-02-04'); // (same as input) latest - 1 day
        expect(actualEndDate).to.equal('2019-02-05'); // latest date
      });

      it('returns null when both start and end dates are after the latest available data', () => {
        const {
          startDate: actualStartDate,
          endDate: actualEndDate,
        } = new DateSanitiser().sanitiseHistoricDateRange('2019-07-10', '2019-07-20');

        expect(actualStartDate).to.be.null;
        expect(actualEndDate).to.be.null;
      });

      it("request for today's data returns null", () => {
        const {
          startDate: actualStartDate,
          endDate: actualEndDate,
        } = new DateSanitiser().sanitiseHistoricDateRange('2019-02-05', '2019-02-05');

        expect(actualStartDate).to.be.null;
        expect(actualEndDate).to.be.null;
      });
    });
  });
});
