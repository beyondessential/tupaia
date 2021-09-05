/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import {
  MERGEABLE_ANALYTICS,
  UNIQUE_MERGEABLE_ANALYTICS,
  MERGEABLE_ANALYTICS_WITH_NULL_VALUES,
  MULTIPLE_ANALYTICS,
} from './transform.fixtures';
import { buildTransform } from '../../../reportBuilder/transform';

describe('groupRows', () => {
  it('throws error when mergeUsing is no specified', () => {
    expect(() =>
      buildTransform([
        {
          transform: 'groupRows',
          by: 'period',
        },
      ]),
    ).toThrow();
  });

  it('throws error when mergeUsing contains an invalid merge strategy', () => {
    expect(() =>
      buildTransform([
        {
          transform: 'groupRows',
          mergeUsing: 'invalid_strategy',
        },
      ]),
    ).toThrow();
  });

  it('when no by is specified, group to a single row', () => {
    const transform = buildTransform([
      {
        transform: 'groupRows',
        mergeUsing: {
          organisationUnit: 'exclude',
          period: 'exclude',
          '*': 'sum',
        },
      },
    ]);
    expect(transform(MERGEABLE_ANALYTICS)).toEqual([{ BCD1: 28, BCD2: 123 }]);
  });

  it('can group by a single field', () => {
    const transform = buildTransform([
      {
        transform: 'groupRows',
        by: 'organisationUnit',
        mergeUsing: 'last',
      },
    ]);
    expect(transform(MERGEABLE_ANALYTICS)).toEqual([
      { organisationUnit: 'TO', period: '20200103', BCD1: 5, BCD2: 0 },
      { organisationUnit: 'PG', period: '20200103', BCD1: 2, BCD2: -1 },
    ]);
  });

  it('can group by a multiple fields', () => {
    const transform = buildTransform([
      {
        transform: 'groupRows',
        by: ['organisationUnit', 'period'],
        mergeUsing: 'sum',
      },
    ]);
    expect(transform(MERGEABLE_ANALYTICS)).toEqual([
      { organisationUnit: 'TO', period: '20200101', BCD1: 4, BCD2: 11 },
      { organisationUnit: 'TO', period: '20200102', BCD1: 2, BCD2: 1 },
      { organisationUnit: 'TO', period: '20200103', BCD1: 5, BCD2: 0 },
      { organisationUnit: 'PG', period: '20200101', BCD1: 7, BCD2: 13 },
      { organisationUnit: 'PG', period: '20200102', BCD1: 8, BCD2: 99 },
      { organisationUnit: 'PG', period: '20200103', BCD1: 2, BCD2: -1 },
    ]);
  });

  it('can perform different merge strategies on different fields', () => {
    const transform = buildTransform([
      {
        transform: 'groupRows',
        by: 'organisationUnit',
        mergeUsing: {
          period: 'last',
          BCD1: 'sum',
          BCD2: 'min',
        },
      },
    ]);
    expect(transform(MERGEABLE_ANALYTICS)).toEqual([
      { organisationUnit: 'TO', period: '20200103', BCD1: 11, BCD2: 0 },
      { organisationUnit: 'PG', period: '20200103', BCD1: 17, BCD2: -1 },
    ]);
  });

  describe('merge strategies', () => {
    it('sum', () => {
      const transform = buildTransform([
        {
          transform: 'groupRows',
          by: 'organisationUnit',
          mergeUsing: {
            period: 'exclude',
            '*': 'sum',
          },
        },
      ]);
      expect(transform(MERGEABLE_ANALYTICS)).toEqual([
        { organisationUnit: 'TO', BCD1: 11, BCD2: 12 },
        { organisationUnit: 'PG', BCD1: 17, BCD2: 111 },
      ]);
    });

    it('sum -> exclude null values', () => {
      const transform = buildTransform([
        {
          transform: 'groupRows',
          by: 'organisationUnit',
          mergeUsing: {
            period: 'exclude',
            '*': 'sum',
          },
        },
      ]);
      expect(transform([...MERGEABLE_ANALYTICS, ...MERGEABLE_ANALYTICS_WITH_NULL_VALUES])).toEqual([
        { organisationUnit: 'TO', BCD1: 11, BCD2: 12 },
        { organisationUnit: 'PG', BCD1: 17, BCD2: 111 },
      ]);
    });

    it('avg', () => {
      const transform = buildTransform([
        {
          transform: 'groupRows',
          by: 'organisationUnit',
          mergeUsing: {
            period: 'exclude',
            '*': 'avg',
          },
        },
      ]);
      expect(transform(MERGEABLE_ANALYTICS)).toEqual([
        { organisationUnit: 'TO', BCD1: 3.6666666666666665, BCD2: 4 },
        { organisationUnit: 'PG', BCD1: 5.666666666666667, BCD2: 37 },
      ]);
    });

    it('count', () => {
      const transform = buildTransform([
        {
          transform: 'groupRows',
          by: 'period',
          mergeUsing: 'count',
        },
      ]);
      expect(transform(MERGEABLE_ANALYTICS)).toEqual([
        { organisationUnit: 4, period: '20200101', BCD1: 2, BCD2: 2 },
        { organisationUnit: 4, period: '20200102', BCD1: 2, BCD2: 2 },
        { organisationUnit: 4, period: '20200103', BCD1: 2, BCD2: 2 },
      ]);
    });

    it('max', () => {
      const transform = buildTransform([
        {
          transform: 'groupRows',
          by: 'organisationUnit',
          mergeUsing: 'max',
        },
      ]);
      expect(transform(MERGEABLE_ANALYTICS)).toEqual([
        { organisationUnit: 'TO', period: '20200103', BCD1: 5, BCD2: 11 },
        { organisationUnit: 'PG', period: '20200103', BCD1: 8, BCD2: 99 },
      ]);
    });

    it('min', () => {
      const transform = buildTransform([
        {
          transform: 'groupRows',
          by: 'period',
          mergeUsing: 'min',
        },
      ]);
      expect(transform(MERGEABLE_ANALYTICS)).toEqual([
        { organisationUnit: 'PG', period: '20200101', BCD1: 4, BCD2: 11 },
        { organisationUnit: 'PG', period: '20200102', BCD1: 2, BCD2: 1 },
        { organisationUnit: 'PG', period: '20200103', BCD1: 2, BCD2: -1 },
      ]);
    });

    it('min -> consider null as minimum', () => {
      const transform = buildTransform([
        {
          transform: 'groupRows',
          by: 'period',
          mergeUsing: 'min',
        },
      ]);
      expect(transform([...MERGEABLE_ANALYTICS, ...MERGEABLE_ANALYTICS_WITH_NULL_VALUES])).toEqual([
        { organisationUnit: 'PG', period: '20200101', BCD1: null, BCD2: null },
        { organisationUnit: 'PG', period: '20200102', BCD1: 2, BCD2: 1 },
        { organisationUnit: 'PG', period: '20200103', BCD1: 2, BCD2: -1 },
      ]);
    });

    it('unique', () => {
      const transform = buildTransform([
        {
          transform: 'groupRows',
          by: 'organisationUnit',
          mergeUsing: 'unique',
        },
      ]);
      expect(transform(UNIQUE_MERGEABLE_ANALYTICS)).toEqual([
        {
          organisationUnit: 'TO',
          period: 'NO_UNIQUE_VALUE',
          BCD1: 4,
          BCD2: 'NO_UNIQUE_VALUE',
        },
        {
          organisationUnit: 'PG',
          period: 'NO_UNIQUE_VALUE',
          BCD1: 'NO_UNIQUE_VALUE',
          BCD2: 99,
        },
      ]);
    });

    it('exclude', () => {
      const transform = buildTransform([
        {
          transform: 'groupRows',
          by: 'period',
          mergeUsing: 'exclude',
        },
      ]);
      expect(transform(MERGEABLE_ANALYTICS)).toEqual([
        { period: '20200101' },
        { period: '20200102' },
        { period: '20200103' },
      ]);
    });

    it('first', () => {
      const transform = buildTransform([
        {
          transform: 'groupRows',
          by: 'organisationUnit',
          mergeUsing: 'first',
        },
      ]);
      expect(transform(MERGEABLE_ANALYTICS)).toEqual([
        { organisationUnit: 'TO', period: '20200101', BCD1: 4, BCD2: 11 },
        { organisationUnit: 'PG', period: '20200101', BCD1: 7, BCD2: 13 },
      ]);
    });

    it('last', () => {
      const transform = buildTransform([
        {
          transform: 'groupRows',
          by: 'period',
          mergeUsing: 'last',
        },
      ]);
      expect(transform(MERGEABLE_ANALYTICS)).toEqual([
        { organisationUnit: 'PG', period: '20200101', BCD1: 7, BCD2: 13 },
        { organisationUnit: 'PG', period: '20200102', BCD1: 8, BCD2: 99 },
        { organisationUnit: 'PG', period: '20200103', BCD1: 2, BCD2: -1 },
      ]);
    });

    describe('single', () => {
      it('throws error is multiple values exist per group', () => {
        const transform = buildTransform([
          {
            transform: 'groupRows',
            by: 'period',
            mergeUsing: 'single',
          },
        ]);
        expect(() => transform(MERGEABLE_ANALYTICS)).toThrow();
      });

      it('returns the value if a single value exists per group', () => {
        const transform = buildTransform([
          {
            transform: 'groupRows',
            by: 'period',
            mergeUsing: 'single',
          },
        ]);
        expect(transform(MULTIPLE_ANALYTICS)).toEqual([
          { organisationUnit: 'TO', period: '20200101', dataElement: 'BCD1', value: 4 },
          { organisationUnit: 'TO', period: '20200102', dataElement: 'BCD1', value: 2 },
          { organisationUnit: 'TO', period: '20200103', dataElement: 'BCD1', value: 5 },
        ]);
      });
    });
  });
});
