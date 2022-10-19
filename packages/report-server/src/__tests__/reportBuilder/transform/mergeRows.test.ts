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
import { buildTransform, TransformTable } from '../../../reportBuilder/transform';

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
    expect(transform(TransformTable.fromRows(SINGLE_MERGEABLE_ANALYTICS))).toStrictEqual(
      TransformTable.fromRows([{ period: '20200101', BCD1: 4, BCD2: 4, BCD3: 4 }]),
    );
  });

  it('when no groupBy is specified, group to a single row', () => {
    const transform = buildTransform([
      {
        transform: 'mergeRows',
        using: {
          organisationUnit: 'first',
          period: 'first',
          '*': 'sum',
        },
      },
    ]);
    expect(transform(TransformTable.fromRows(MERGEABLE_ANALYTICS))).toStrictEqual(
      TransformTable.fromRows([
        { period: '20200101', organisationUnit: 'TO', BCD1: 28, BCD2: 123 },
      ]),
    );
  });

  it('can group by a single field', () => {
    const transform = buildTransform([
      {
        transform: 'mergeRows',
        groupBy: 'organisationUnit',
        using: 'last',
      },
    ]);
    expect(transform(TransformTable.fromRows(MERGEABLE_ANALYTICS))).toStrictEqual(
      TransformTable.fromRows([
        { period: '20200103', organisationUnit: 'TO', BCD1: 5, BCD2: 0 },
        { period: '20200103', organisationUnit: 'PG', BCD1: 2, BCD2: -1 },
      ]),
    );
  });

  it('can group by a multiple fields', () => {
    const transform = buildTransform([
      {
        transform: 'mergeRows',
        groupBy: ['organisationUnit', 'period'],
        using: 'sum',
      },
    ]);
    expect(transform(TransformTable.fromRows(MERGEABLE_ANALYTICS))).toStrictEqual(
      TransformTable.fromRows([
        { period: '20200101', organisationUnit: 'TO', BCD1: 4, BCD2: 11 },
        { period: '20200102', organisationUnit: 'TO', BCD1: 2, BCD2: 1 },
        { period: '20200103', organisationUnit: 'TO', BCD1: 5, BCD2: 0 },
        { period: '20200101', organisationUnit: 'PG', BCD1: 7, BCD2: 13 },
        { period: '20200102', organisationUnit: 'PG', BCD1: 8, BCD2: 99 },
        { period: '20200103', organisationUnit: 'PG', BCD1: 2, BCD2: -1 },
      ]),
    );
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
    expect(transform(TransformTable.fromRows(MERGEABLE_ANALYTICS))).toStrictEqual(
      TransformTable.fromRows([
        { period: '20200103', organisationUnit: 'TO', BCD1: 11, BCD2: 0 },
        { period: '20200103', organisationUnit: 'PG', BCD1: 17, BCD2: -1 },
      ]),
    );
  });

  describe('merge strategies', () => {
    it('sum', () => {
      const transform = buildTransform([
        {
          transform: 'mergeRows',
          groupBy: 'organisationUnit',
          using: {
            period: 'first',
            '*': 'sum',
          },
        },
      ]);
      expect(transform(TransformTable.fromRows(MERGEABLE_ANALYTICS))).toStrictEqual(
        TransformTable.fromRows([
          { period: '20200101', organisationUnit: 'TO', BCD1: 11, BCD2: 12 },
          { period: '20200101', organisationUnit: 'PG', BCD1: 17, BCD2: 111 },
        ]),
      );
    });

    it('sum -> exclude null values', () => {
      const transform = buildTransform([
        {
          transform: 'mergeRows',
          groupBy: 'organisationUnit',
          using: {
            period: 'first',
            '*': 'sum',
          },
        },
      ]);
      expect(
        transform(
          TransformTable.fromRows([
            ...MERGEABLE_ANALYTICS,
            ...MERGEABLE_ANALYTICS_WITH_NULL_VALUES,
          ]),
        ),
      ).toStrictEqual(
        TransformTable.fromRows([
          { period: '20200101', organisationUnit: 'TO', BCD1: 11, BCD2: 12 },
          { period: '20200101', organisationUnit: 'PG', BCD1: 17, BCD2: 111 },
        ]),
      );
    });

    it('average', () => {
      const transform = buildTransform([
        {
          transform: 'mergeRows',
          groupBy: 'organisationUnit',
          using: {
            period: 'first',
            '*': 'average',
          },
        },
      ]);
      expect(transform(TransformTable.fromRows(MERGEABLE_ANALYTICS))).toStrictEqual(
        TransformTable.fromRows([
          { period: '20200101', organisationUnit: 'TO', BCD1: 3.6666666666666665, BCD2: 4 },
          { period: '20200101', organisationUnit: 'PG', BCD1: 5.666666666666667, BCD2: 37 },
        ]),
      );
    });

    it('count', () => {
      const transform = buildTransform([
        {
          transform: 'mergeRows',
          groupBy: 'period',
          using: 'count',
        },
      ]);
      expect(transform(TransformTable.fromRows(MERGEABLE_ANALYTICS))).toStrictEqual(
        TransformTable.fromRows([
          { period: '20200101', organisationUnit: 4, BCD1: 2, BCD2: 2 },
          { period: '20200102', organisationUnit: 4, BCD1: 2, BCD2: 2 },
          { period: '20200103', organisationUnit: 4, BCD1: 2, BCD2: 2 },
        ]),
      );
    });

    it('max', () => {
      const transform = buildTransform([
        {
          transform: 'mergeRows',
          groupBy: 'organisationUnit',
          using: 'max',
        },
      ]);
      expect(transform(TransformTable.fromRows(MERGEABLE_ANALYTICS))).toStrictEqual(
        TransformTable.fromRows([
          { period: '20200103', organisationUnit: 'TO', BCD1: 5, BCD2: 11 },
          { period: '20200103', organisationUnit: 'PG', BCD1: 8, BCD2: 99 },
        ]),
      );
    });

    it('min', () => {
      const transform = buildTransform([
        {
          transform: 'mergeRows',
          groupBy: 'period',
          using: 'min',
        },
      ]);
      expect(transform(TransformTable.fromRows(MERGEABLE_ANALYTICS))).toStrictEqual(
        TransformTable.fromRows([
          { period: '20200101', organisationUnit: 'PG', BCD1: 4, BCD2: 11 },
          { period: '20200102', organisationUnit: 'PG', BCD1: 2, BCD2: 1 },
          { period: '20200103', organisationUnit: 'PG', BCD1: 2, BCD2: -1 },
        ]),
      );
    });

    it('min -> consider null as minimum', () => {
      const transform = buildTransform([
        {
          transform: 'mergeRows',
          groupBy: 'period',
          using: 'min',
        },
      ]);
      expect(
        transform(
          TransformTable.fromRows([
            ...MERGEABLE_ANALYTICS,
            ...MERGEABLE_ANALYTICS_WITH_NULL_VALUES,
          ]),
        ),
      ).toStrictEqual(
        TransformTable.fromRows([
          { period: '20200101', organisationUnit: 'PG', BCD1: null, BCD2: null },
          { period: '20200102', organisationUnit: 'PG', BCD1: 2, BCD2: 1 },
          { period: '20200103', organisationUnit: 'PG', BCD1: 2, BCD2: -1 },
        ]),
      );
    });

    it('unique', () => {
      const transform = buildTransform([
        {
          transform: 'mergeRows',
          groupBy: 'organisationUnit',
          using: 'unique',
        },
      ]);
      expect(transform(TransformTable.fromRows(UNIQUE_MERGEABLE_ANALYTICS))).toStrictEqual(
        TransformTable.fromRows([
          {
            period: 'NO_UNIQUE_VALUE',
            organisationUnit: 'TO',
            BCD1: 4,
            BCD2: 'NO_UNIQUE_VALUE',
          },
          {
            period: 'NO_UNIQUE_VALUE',
            organisationUnit: 'PG',
            BCD1: 'NO_UNIQUE_VALUE',
            BCD2: 99,
          },
        ]),
      );
    });

    it('exclude', () => {
      const transform = buildTransform([
        {
          transform: 'mergeRows',
          groupBy: 'period',
          using: 'exclude',
        },
      ]);
      expect(transform(TransformTable.fromRows(MERGEABLE_ANALYTICS))).toStrictEqual(
        TransformTable.fromRows(
          [{ period: '20200101' }, { period: '20200102' }, { period: '20200103' }],
          ['period', 'organisationUnit', 'BCD1', 'BCD2'], // excludes values, but keeps columns
        ),
      );
    });

    it('first', () => {
      const transform = buildTransform([
        {
          transform: 'mergeRows',
          groupBy: 'organisationUnit',
          using: 'first',
        },
      ]);
      expect(transform(TransformTable.fromRows(MERGEABLE_ANALYTICS))).toStrictEqual(
        TransformTable.fromRows([
          { period: '20200101', organisationUnit: 'TO', BCD1: 4, BCD2: 11 },
          { period: '20200101', organisationUnit: 'PG', BCD1: 7, BCD2: 13 },
        ]),
      );
    });

    it('last', () => {
      const transform = buildTransform([
        {
          transform: 'mergeRows',
          groupBy: 'period',
          using: 'last',
        },
      ]);
      expect(transform(TransformTable.fromRows(MERGEABLE_ANALYTICS))).toStrictEqual(
        TransformTable.fromRows([
          { period: '20200101', organisationUnit: 'PG', BCD1: 7, BCD2: 13 },
          { period: '20200102', organisationUnit: 'PG', BCD1: 8, BCD2: 99 },
          { period: '20200103', organisationUnit: 'PG', BCD1: 2, BCD2: -1 },
        ]),
      );
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
        expect(() => transform(TransformTable.fromRows(MERGEABLE_ANALYTICS))).toThrow();
      });

      it('returns the value if a single value exists per group', () => {
        const transform = buildTransform([
          {
            transform: 'mergeRows',
            groupBy: 'period',
            using: 'single',
          },
        ]);
        expect(transform(TransformTable.fromRows(SINGLE_MERGEABLE_ANALYTICS))).toStrictEqual(
          TransformTable.fromRows([{ period: '20200101', BCD1: 4, BCD2: 4, BCD3: 4 }]),
        );
      });
    });
  });
});
