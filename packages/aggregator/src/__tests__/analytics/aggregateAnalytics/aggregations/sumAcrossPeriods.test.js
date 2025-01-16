import MockDate from 'mockdate';

import { arrayToAnalytics } from '@tupaia/tsutils';
import { sumAcrossPeriods } from '../../../../analytics/aggregateAnalytics/aggregations/sumAcrossPeriods';

describe('sumAcrossPeriods', () => {
  const ANALYTICS = arrayToAnalytics([
    // BCD01 - TO
    ['BCD01', 'TO', '201601', 0.01],
    ['BCD01', 'TO', '201801', 0.1],
    ['BCD01', 'TO', '201901', 1],
    // BCD01 - PG
    ['BCD01', 'PG', '201601', 0.02],
    ['BCD01', 'PG', '201801', 0.2],
    ['BCD01', 'PG', '201901', 2],
    // BCD02 - TO
    ['BCD02', 'TO', '201801', 0.04],
    ['BCD02', 'TO', '202001', 0.4],
    ['BCD02', 'TO', '210001', 4.0],
  ]);

  const CURRENT_DATE_STUB = '2020-01-31T00:00:00Z';
  const CURRENT_PERIOD_STUBS = {
    DAY: '20200131',
    YEAR: '2020',
  };

  beforeAll(() => {
    MockDate.set(CURRENT_DATE_STUB);
  });

  it('single analytic', () => {
    expect(sumAcrossPeriods([ANALYTICS[0]])).toStrictEqual(expect.arrayContaining([ANALYTICS[0]]));
  });

  it('multiple analytics', () => {
    expect(sumAcrossPeriods(ANALYTICS)).toStrictEqual(
      arrayToAnalytics([
        ['BCD01', 'TO', '201601', 1.11],
        ['BCD01', 'PG', '201601', 2.22],
        ['BCD02', 'TO', '201801', 4.44],
      ]),
    );
  });

  describe('periodOptions', () => {
    describe('periodType', () => {
      it('does nothing if not set', () => {
        expect(sumAcrossPeriods(ANALYTICS, { periodOptions: {} })).toStrictEqual(
          arrayToAnalytics([
            ['BCD01', 'TO', '201601', 1.11],
            ['BCD01', 'PG', '201601', 2.22],
            ['BCD02', 'TO', '201801', 4.44],
          ]),
        );
      });

      it('converts periods to the specified type', () => {
        expect(
          sumAcrossPeriods(ANALYTICS, { periodOptions: { periodType: 'YEAR' } }),
        ).toStrictEqual(
          arrayToAnalytics([
            ['BCD01', 'TO', '2016', 1.11],
            ['BCD01', 'PG', '2016', 2.22],
            ['BCD02', 'TO', '2018', 4.44],
          ]),
        );
      });
    });

    describe('useCurrent', () => {
      it('defaults to `false`', () => {
        expect(sumAcrossPeriods(ANALYTICS, { periodOptions: {} })).toStrictEqual(
          sumAcrossPeriods(ANALYTICS, { periodOptions: { useCurrent: false } }),
        );
      });

      it('does nothing if not set', () => {
        expect(sumAcrossPeriods(ANALYTICS, { periodOptions: { useCurrent: false } })).toStrictEqual(
          arrayToAnalytics([
            ['BCD01', 'TO', '201601', 1.11],
            ['BCD01', 'PG', '201601', 2.22],
            ['BCD02', 'TO', '201801', 4.44],
          ]),
        );
      });

      it('uses the current period of the specified type', () => {
        expect(
          sumAcrossPeriods(ANALYTICS, { periodOptions: { useCurrent: true, periodType: 'YEAR' } }),
        ).toStrictEqual(
          arrayToAnalytics([
            ['BCD01', 'TO', CURRENT_PERIOD_STUBS.YEAR, 1.11],
            ['BCD01', 'PG', CURRENT_PERIOD_STUBS.YEAR, 2.22],
            ['BCD02', 'TO', CURRENT_PERIOD_STUBS.YEAR, 4.44],
          ]),
        );
      });

      it('uses DAY period type by default', () => {
        expect(sumAcrossPeriods(ANALYTICS, { periodOptions: { useCurrent: true } })).toStrictEqual(
          arrayToAnalytics([
            ['BCD01', 'TO', CURRENT_PERIOD_STUBS.DAY, 1.11],
            ['BCD01', 'PG', CURRENT_PERIOD_STUBS.DAY, 2.22],
            ['BCD02', 'TO', CURRENT_PERIOD_STUBS.DAY, 4.44],
          ]),
        );
      });
    });

    describe('excludeFuture', () => {
      it('defaults to `false`', () => {
        expect(sumAcrossPeriods(ANALYTICS, { periodOptions: {} })).toStrictEqual(
          sumAcrossPeriods(ANALYTICS, { periodOptions: { excludeFuture: false } }),
        );
      });

      it('does nothing if not set', () => {
        expect(
          sumAcrossPeriods(ANALYTICS, {
            periodOptions: { excludeFuture: false },
          }),
        ).toStrictEqual(
          arrayToAnalytics([
            ['BCD01', 'TO', '201601', 1.11],
            ['BCD01', 'PG', '201601', 2.22],
            ['BCD02', 'TO', '201801', 4.44],
          ]),
        );
      });

      it('filters future periods', () => {
        expect(
          sumAcrossPeriods(ANALYTICS, { periodOptions: { excludeFuture: true } }),
        ).toStrictEqual(
          arrayToAnalytics([
            ['BCD01', 'TO', '201601', 1.11],
            ['BCD01', 'PG', '201601', 2.22],
            ['BCD02', 'TO', '201801', 0.44],
          ]),
        );
      });
    });
  });
});
