/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import {
  AGGREGATEABLE_ANALYTICS,
  UNIQUE_AGGREGATEABLE_ANALYTICS,
  AGGREGATEABLE_ANALYTICS_WITH_NULL_VALUES,
  MULTIPLE_ANALYTICS,
} from './transform.fixtures';
import { buildTransform } from '../../../reportBuilder/transform';

describe('aggregate', () => {
  it('can not group by a any field', () => {
    const transform = buildTransform([
      {
        transform: 'aggregate',
        organisationUnit: 'drop',
        period: 'drop',
        '...': 'sum',
      },
    ]);
    expect(transform(AGGREGATEABLE_ANALYTICS)).toEqual([{ BCD1: 28, BCD2: 123 }]);
  });

  it('can group by a single field', () => {
    const transform = buildTransform([
      {
        transform: 'aggregate',
        organisationUnit: 'group',
        '...': 'last',
      },
    ]);
    expect(transform(AGGREGATEABLE_ANALYTICS)).toEqual([
      { organisationUnit: 'TO', period: '20200103', BCD1: 5, BCD2: 0 },
      { organisationUnit: 'PG', period: '20200103', BCD1: 2, BCD2: -1 },
    ]);
  });

  it('can group by a multiple fields', () => {
    const transform = buildTransform([
      {
        transform: 'aggregate',
        organisationUnit: 'group',
        period: 'group',
        '...': 'sum',
      },
    ]);
    expect(transform(AGGREGATEABLE_ANALYTICS)).toEqual([
      { organisationUnit: 'TO', period: '20200101', BCD1: 4, BCD2: 11 },
      { organisationUnit: 'TO', period: '20200102', BCD1: 2, BCD2: 1 },
      { organisationUnit: 'TO', period: '20200103', BCD1: 5, BCD2: 0 },
      { organisationUnit: 'PG', period: '20200101', BCD1: 7, BCD2: 13 },
      { organisationUnit: 'PG', period: '20200102', BCD1: 8, BCD2: 99 },
      { organisationUnit: 'PG', period: '20200103', BCD1: 2, BCD2: -1 },
    ]);
  });

  it('can perform different aggregations on different fields', () => {
    const transform = buildTransform([
      {
        transform: 'aggregate',
        organisationUnit: 'group',
        period: 'last',
        BCD1: 'sum',
        BCD2: 'min',
      },
    ]);
    expect(transform(AGGREGATEABLE_ANALYTICS)).toEqual([
      { organisationUnit: 'TO', period: '20200103', BCD1: 11, BCD2: 0 },
      { organisationUnit: 'PG', period: '20200103', BCD1: 17, BCD2: -1 },
    ]);
  });

  describe('aggregations', () => {
    it('sum', () => {
      const transform = buildTransform([
        {
          transform: 'aggregate',
          organisationUnit: 'group',
          period: 'drop',
          '...': 'sum',
        },
      ]);
      expect(transform(AGGREGATEABLE_ANALYTICS)).toEqual([
        { organisationUnit: 'TO', BCD1: 11, BCD2: 12 },
        { organisationUnit: 'PG', BCD1: 17, BCD2: 111 },
      ]);
    });

    it('sum -> exclude null values', () => {
      const transform = buildTransform([
        {
          transform: 'aggregate',
          organisationUnit: 'group',
          period: 'drop',
          '...': 'sum',
        },
      ]);
      expect(
        transform([...AGGREGATEABLE_ANALYTICS, ...AGGREGATEABLE_ANALYTICS_WITH_NULL_VALUES]),
      ).toEqual([
        { organisationUnit: 'TO', BCD1: 11, BCD2: 12 },
        { organisationUnit: 'PG', BCD1: 17, BCD2: 111 },
      ]);
    });

    it('avg', () => {
      const transform = buildTransform([
        {
          transform: 'aggregate',
          organisationUnit: 'group',
          period: 'drop',
          '...': 'avg',
        },
      ]);
      expect(transform(AGGREGATEABLE_ANALYTICS)).toEqual([
        { organisationUnit: 'TO', BCD1: 3.6666666666666665, BCD2: 4 },
        { organisationUnit: 'PG', BCD1: 5.666666666666667, BCD2: 37 },
      ]);
    });

    it('count', () => {
      const transform = buildTransform([
        {
          transform: 'aggregate',
          period: 'group',
          '...': 'count',
        },
      ]);
      expect(transform(AGGREGATEABLE_ANALYTICS)).toEqual([
        { organisationUnit: 4, period: '20200101', BCD1: 2, BCD2: 2 },
        { organisationUnit: 4, period: '20200102', BCD1: 2, BCD2: 2 },
        { organisationUnit: 4, period: '20200103', BCD1: 2, BCD2: 2 },
      ]);
    });

    it('max', () => {
      const transform = buildTransform([
        {
          transform: 'aggregate',
          organisationUnit: 'group',
          '...': 'max',
        },
      ]);
      expect(transform(AGGREGATEABLE_ANALYTICS)).toEqual([
        { organisationUnit: 'TO', period: '20200103', BCD1: 5, BCD2: 11 },
        { organisationUnit: 'PG', period: '20200103', BCD1: 8, BCD2: 99 },
      ]);
    });

    it('min', () => {
      const transform = buildTransform([
        {
          transform: 'aggregate',
          period: 'group',
          '...': 'min',
        },
      ]);
      expect(transform(AGGREGATEABLE_ANALYTICS)).toEqual([
        { organisationUnit: 'PG', period: '20200101', BCD1: 4, BCD2: 11 },
        { organisationUnit: 'PG', period: '20200102', BCD1: 2, BCD2: 1 },
        { organisationUnit: 'PG', period: '20200103', BCD1: 2, BCD2: -1 },
      ]);
    });

    it('min -> consider null as minimum', () => {
      const transform = buildTransform([
        {
          transform: 'aggregate',
          period: 'group',
          '...': 'min',
        },
      ]);
      expect(
        transform([...AGGREGATEABLE_ANALYTICS, ...AGGREGATEABLE_ANALYTICS_WITH_NULL_VALUES]),
      ).toEqual([
        { organisationUnit: 'PG', period: '20200101', BCD1: null, BCD2: null },
        { organisationUnit: 'PG', period: '20200102', BCD1: 2, BCD2: 1 },
        { organisationUnit: 'PG', period: '20200103', BCD1: 2, BCD2: -1 },
      ]);
    });

    it('unique', () => {
      const transform = buildTransform([
        {
          transform: 'aggregate',
          organisationUnit: 'group',
          '...': 'unique',
        },
      ]);
      expect(transform(UNIQUE_AGGREGATEABLE_ANALYTICS)).toEqual([
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

    it('drop', () => {
      const transform = buildTransform([
        {
          transform: 'aggregate',
          period: 'group',
          '...': 'drop',
        },
      ]);
      expect(transform(AGGREGATEABLE_ANALYTICS)).toEqual([
        { period: '20200101' },
        { period: '20200102' },
        { period: '20200103' },
      ]);
    });

    it('first', () => {
      const transform = buildTransform([
        {
          transform: 'aggregate',
          organisationUnit: 'group',
          '...': 'first',
        },
      ]);
      expect(transform(AGGREGATEABLE_ANALYTICS)).toEqual([
        { organisationUnit: 'TO', period: '20200101', BCD1: 4, BCD2: 11 },
        { organisationUnit: 'PG', period: '20200101', BCD1: 7, BCD2: 13 },
      ]);
    });

    it('last', () => {
      const transform = buildTransform([
        {
          transform: 'aggregate',
          period: 'group',
          '...': 'last',
        },
      ]);
      expect(transform(AGGREGATEABLE_ANALYTICS)).toEqual([
        { organisationUnit: 'PG', period: '20200101', BCD1: 7, BCD2: 13 },
        { organisationUnit: 'PG', period: '20200102', BCD1: 8, BCD2: 99 },
        { organisationUnit: 'PG', period: '20200103', BCD1: 2, BCD2: -1 },
      ]);
    });

    describe('single', () => {
      it('throws error is multiple values exist per group', () => {
        const transform = buildTransform([
          {
            transform: 'aggregate',
            period: 'group',
            '...': 'single',
          },
        ]);
        expect(() => transform(AGGREGATEABLE_ANALYTICS)).toThrow();
      });

      it('returns the value if a single value exists per group', () => {
        const transform = buildTransform([
          {
            transform: 'aggregate',
            period: 'group',
            '...': 'single',
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
