/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import {
  MERGEABLE_ANALYTICS,
  UNIQUE_MERGEABLE_ANALYTICS,
  MERGEABLE_ANALYTICS_WITH_NULL_VALUES,
  SINGLE_MERGEABLE_ANALYTICS,
} from './transform.fixtures';
import { buildTransform } from '../../../reportBuilder/transform';

describe('mergeRows', () => {
  it('throws error when mergeUsing contains an invalid merge strategy', () => {
    expect(() =>
      buildTransform([
        {
          transform: 'mergeRows',
          using: 'invalid_strategy',
        },
      ]),
    ).toThrow();
  });

  it('defaults to single when using is not specified', () => {
    const transform = buildTransform([
      {
        transform: 'mergeRows',
        groupBy: 'period',
      },
    ]);
    expect(transform(SINGLE_MERGEABLE_ANALYTICS)).toEqual([
      { period: '20200101', BCD1: 4, BCD2: 4, BCD3: 4 },
    ]);
  });

  it('when no groupBy is specified, group to a single row', () => {
    const transform = buildTransform([
      {
        transform: 'mergeRows',
        using: {
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
        transform: 'mergeRows',
        groupBy: 'organisationUnit',
        using: 'last',
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
        transform: 'mergeRows',
        groupBy: ['organisationUnit', 'period'],
        using: 'sum',
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
        transform: 'mergeRows',
        groupBy: 'organisationUnit',
        using: {
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
          transform: 'mergeRows',
          groupBy: 'organisationUnit',
          using: {
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
          transform: 'mergeRows',
          groupBy: 'organisationUnit',
          using: {
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

    it('average', () => {
      const transform = buildTransform([
        {
          transform: 'mergeRows',
          groupBy: 'organisationUnit',
          using: {
            period: 'exclude',
            '*': 'average',
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
          transform: 'mergeRows',
          groupBy: 'period',
          using: 'count',
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
          transform: 'mergeRows',
          groupBy: 'organisationUnit',
          using: 'max',
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
          transform: 'mergeRows',
          groupBy: 'period',
          using: 'min',
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
          transform: 'mergeRows',
          groupBy: 'period',
          using: 'min',
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
          transform: 'mergeRows',
          groupBy: 'organisationUnit',
          using: 'unique',
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
          transform: 'mergeRows',
          groupBy: 'period',
          using: 'exclude',
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
          transform: 'mergeRows',
          groupBy: 'organisationUnit',
          using: 'first',
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
          transform: 'mergeRows',
          groupBy: 'period',
          using: 'last',
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
            transform: 'mergeRows',
            groupBy: 'period',
            using: 'single',
          },
        ]);
        expect(() => transform(MERGEABLE_ANALYTICS)).toThrow();
      });

      it('returns the value if a single value exists per group', () => {
        const transform = buildTransform([
          {
            transform: 'mergeRows',
            groupBy: 'period',
            using: 'single',
          },
        ]);
        expect(transform(SINGLE_MERGEABLE_ANALYTICS)).toEqual([
          { period: '20200101', BCD1: 4, BCD2: 4, BCD3: 4 },
        ]);
      });
    });
  });
});
