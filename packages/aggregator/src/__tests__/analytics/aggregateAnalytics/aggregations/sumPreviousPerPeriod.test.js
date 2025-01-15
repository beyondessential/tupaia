import { arrayToAnalytics, PERIOD_TYPES } from '@tupaia/tsutils';

import {
  getDateRangeForSumPreviousPerPeriod,
  sumPreviousPerPeriod,
} from '../../../../analytics/aggregateAnalytics/aggregations/sumPreviousPerPeriod';

const { DAY } = PERIOD_TYPES;
const { YEAR } = PERIOD_TYPES;

describe('sumPreviousPerPeriod()', () => {
  it('sums across periods', () => {
    const analytics = arrayToAnalytics([
      ['BCD1', 'TO', '20200101', 1],
      ['BCD1', 'TO', '20200102', 2],
      ['BCD1', 'TO', '20200103', 3],
    ]);
    const expected = arrayToAnalytics([
      ['BCD1', 'TO', '20200101', 1],
      ['BCD1', 'TO', '20200102', 3],
      ['BCD1', 'TO', '20200103', 6],
    ]);
    expect(sumPreviousPerPeriod(analytics, { sumTillLatestData: true }, DAY)).toIncludeSameMembers(
      expected,
    );
  });

  it('combines by org unit and data element', () => {
    const analytics = arrayToAnalytics([
      ['BCD1', 'TO', '20200101', 1],
      ['BCD2', 'TO', '20200101', 2],
      ['BCD1', 'PG', '20200101', 3],
      ['BCD2', 'PG', '20200101', 4],
      //
      ['BCD1', 'TO', '20200102', 5],
      ['BCD2', 'TO', '20200102', 6],
      ['BCD1', 'PG', '20200102', 7],
      ['BCD2', 'PG', '20200102', 8],
    ]);
    const expected = arrayToAnalytics([
      ['BCD1', 'TO', '20200101', 1],
      ['BCD2', 'TO', '20200101', 2],
      ['BCD1', 'PG', '20200101', 3],
      ['BCD2', 'PG', '20200101', 4],
      //
      ['BCD1', 'TO', '20200102', 6],
      ['BCD2', 'TO', '20200102', 8],
      ['BCD1', 'PG', '20200102', 10],
      ['BCD2', 'PG', '20200102', 12],
    ]);
    expect(sumPreviousPerPeriod(analytics, { sumTillLatestData: true }, DAY)).toIncludeSameMembers(
      expected,
    );
  });

  it('sums with missing analytics', () => {
    const analytics = arrayToAnalytics([
      ['BCD1', 'TO', '20200101', 1],
      // ['BCD1', 'TO', '20200102', 2],
      ['BCD1', 'TO', '20200103', 3],
    ]);
    const expected = arrayToAnalytics([
      ['BCD1', 'TO', '20200101', 1],
      ['BCD1', 'TO', '20200102', 1],
      ['BCD1', 'TO', '20200103', 4],
    ]);
    expect(sumPreviousPerPeriod(analytics, { sumTillLatestData: true }, DAY)).toIncludeSameMembers(
      expected,
    );
  });

  it('sums with no analytics', () => {
    const analytics = [];
    const expected = [];
    expect(sumPreviousPerPeriod(analytics, { sumTillLatestData: true }, DAY)).toIncludeSameMembers(
      expected,
    );
  });

  it('only returns results within requestedPeriod if oldest request period > oldest data', () => {
    const analytics = arrayToAnalytics([
      ['BCD1', 'TO', '20200101', 1],
      ['BCD1', 'TO', '20200102', 2],
      ['BCD1', 'TO', '20200103', 3],
    ]);
    const config = { requestedPeriod: '20200102;20200103;20200104', sumTillLatestData: true };
    const expected = arrayToAnalytics([
      ['BCD1', 'TO', '20200102', 3],
      ['BCD1', 'TO', '20200103', 6],
    ]);
    expect(sumPreviousPerPeriod(analytics, config, DAY)).toIncludeSameMembers(expected);
  });

  it('only returns results within requestedPeriod if latest request period < newest data', () => {
    const analytics = arrayToAnalytics([
      ['BCD1', 'TO', '20200101', 1],
      ['BCD1', 'TO', '20200102', 2],
      ['BCD1', 'TO', '20200103', 3],
    ]);
    const config = { requestedPeriod: '20191231;20200101;20200102', sumTillLatestData: true };
    const expected = arrayToAnalytics([
      ['BCD1', 'TO', '20200101', 1],
      ['BCD1', 'TO', '20200102', 3],
    ]);
    expect(sumPreviousPerPeriod(analytics, config, DAY)).toIncludeSameMembers(expected);
  });

  it('works if there is no data for the first period', () => {
    const analytics = arrayToAnalytics([
      ['BCD1', 'TO', '20200101', 1],
      // [ 'BCD1', 'TO',  '20200102',  2 ],
      ['BCD1', 'TO', '20200103', 3],
    ]);
    const config = { requestedPeriod: '20200102;20200103', sumTillLatestData: true };
    const expected = arrayToAnalytics([
      ['BCD1', 'TO', '20200102', 1],
      ['BCD1', 'TO', '20200103', 4],
    ]);
    expect(sumPreviousPerPeriod(analytics, config, DAY)).toIncludeSameMembers(expected);
  });

  it('sum till latest period when sumTillLatestData is disable', () => {
    const analytics = arrayToAnalytics([
      ['BCD1', 'TO', '20200101', 1],
      ['BCD1', 'TO', '20200102', 2],
      ['BCD1', 'TO', '20200103', 3],
    ]);
    const config = { requestedPeriod: '20200105;20200106', sumTillLatestData: false };
    const expected = arrayToAnalytics([
      ['BCD1', 'TO', '20200105', 6],
      ['BCD1', 'TO', '20200106', 6],
    ]);
    expect(sumPreviousPerPeriod(analytics, config, DAY)).toIncludeSameMembers(expected);
  });

  // It won't work with non numeric periods. eg: 2020W2
  it('does everything with a different period type', () => {
    const analytics = arrayToAnalytics([
      ['BCD1', 'TO', '2017', 1],
      ['BCD2', 'TO', '2017', 2],
      //
      ['BCD1', 'TO', '2018', 3],
      ['BCD1', 'PG', '2018', 4],
      //
      ['BCD1', 'TO', '2019', 5],
      //
      ['BCD1', 'TO', '2020', 6],
      ['BCD1', 'PG', '2020', 7],
      ['BCD2', 'TO', '2020', 8],
    ]);
    const config = { requestedPeriod: '2019;2020;2021;2022', sumTillLatestData: true };
    const expected = arrayToAnalytics([
      ['BCD1', 'TO', '2019', 9],
      ['BCD2', 'TO', '2019', 2],
      ['BCD1', 'PG', '2019', 4],
      //
      ['BCD1', 'TO', '2020', 15],
      ['BCD2', 'TO', '2020', 10],
      ['BCD1', 'PG', '2020', 11],
    ]);
    expect(sumPreviousPerPeriod(analytics, config, YEAR)).toIncludeSameMembers(expected);
  });
});

describe('getDateRangeForSumPreviousPerPeriod()', () => {
  it('returns a date range from the earliest Tupaia data date till the provided end date', () => {
    const input = { startDate: '2020-01-01', endDate: '2020-06-07' };
    const expected = { startDate: '2017-01-01', endDate: '2020-06-07' };
    expect(getDateRangeForSumPreviousPerPeriod(input)).toStrictEqual(expected);
  });
});
