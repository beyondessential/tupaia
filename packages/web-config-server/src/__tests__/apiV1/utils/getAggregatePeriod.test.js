/**
 * Tupaia MediTrak
 * Copyright (c) 2020 Beyond Essential Systems Pty Ltd
 */
import { getAggregatePeriod } from '/apiV1/utils/getAggregatePeriod';

const periods = [
  {
    latestAvailable: '20200104',
    earliestAvailable: '20191104',
    requested: 'WILL_ALWAYS_BE_RETURNED_AS_IT_IS_AT_INDEX_0',
  },
  {
    latestAvailable: '20200201',
    earliestAvailable: '20200201',
    requested: 'NOT_IMPORTANT',
  },
  {
    latestAvailable: '20180201',
    earliestAvailable: '20180201',
    requested: 'NOT_IMPORTANT',
  },
];

describe('getAggregatePeriod()', () => {
  it('should return null if periods is empty or falsey, or only contains falsey values', () => {
    expect(getAggregatePeriod()).toBe(null);
    expect(getAggregatePeriod(null)).toBe(null);
    expect(getAggregatePeriod([])).toBe(null);
    expect(getAggregatePeriod([undefined, null])).toBe(null);
  });

  it('should return an unadulterated period if there is only 1 period passed in', () => {
    expect(getAggregatePeriod([periods[0]])).toStrictEqual(periods[0]);
  });

  it('should return an unadulterated period if there is only 1 truthy period passed in', () => {
    expect(getAggregatePeriod([undefined, periods[0], null, false])).toStrictEqual(periods[0]);
  });

  it('should return an aggregate period for 2 inputs', () => {
    const expectedResponse = {
      latestAvailable: '20200201',
      earliestAvailable: '20191104',
      requested: 'WILL_ALWAYS_BE_RETURNED_AS_IT_IS_AT_INDEX_0',
    };

    expect(getAggregatePeriod([periods[0], periods[1]])).toStrictEqual(expectedResponse);
  });

  it('should return an aggregate period for more than 2 inputs', () => {
    const expectedResponse = {
      latestAvailable: '20200201',
      earliestAvailable: '20180201',
      requested: 'WILL_ALWAYS_BE_RETURNED_AS_IT_IS_AT_INDEX_0',
    };

    expect(getAggregatePeriod(periods)).toStrictEqual(expectedResponse);
  });
});
