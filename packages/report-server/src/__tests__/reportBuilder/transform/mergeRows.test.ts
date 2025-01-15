import {
  MERGEABLE_ANALYTICS,
  UNIQUE_MERGEABLE_ANALYTICS,
  MERGEABLE_ANALYTICS_WITH_NULL_VALUES,
  SINGLE_MERGEABLE_ANALYTICS,
} from './transform.fixtures';
import { TransformTable } from '../../../reportBuilder/transform';
import { buildTestTransform } from '../testUtils';

describe('mergeRows', () => {
  it('throws error when mergeUsing contains an invalid merge strategy', () => {
    expect(() =>
      buildTestTransform([
        {
          transform: 'mergeRows',
          using: 'invalid_strategy',
        },
      ]),
    ).toThrow();
  });

  it('defaults to single when using is not specified', async () => {
    const transform = buildTestTransform([
      {
        transform: 'mergeRows',
        groupBy: 'period',
      },
    ]);
    expect(await transform(TransformTable.fromRows(SINGLE_MERGEABLE_ANALYTICS))).toStrictEqual(
      TransformTable.fromRows([{ period: '20200101', BCD1: 4, BCD2: 4, BCD3: 4 }]),
    );
  });

  it('when no groupBy is specified, group to a single row', async () => {
    const transform = buildTestTransform([
      {
        transform: 'mergeRows',
        using: {
          organisationUnit: 'first',
          period: 'first',
          '*': 'sum',
        },
      },
    ]);
    expect(await transform(TransformTable.fromRows(MERGEABLE_ANALYTICS))).toStrictEqual(
      TransformTable.fromRows([
        { period: '20200101', organisationUnit: 'TO', BCD1: 28, BCD2: 123 },
      ]),
    );
  });

  it('can group by a single field', async () => {
    const transform = buildTestTransform([
      {
        transform: 'mergeRows',
        groupBy: 'organisationUnit',
        using: 'last',
      },
    ]);
    expect(await transform(TransformTable.fromRows(MERGEABLE_ANALYTICS))).toStrictEqual(
      TransformTable.fromRows([
        { period: '20200103', organisationUnit: 'TO', BCD1: 5, BCD2: 0 },
        { period: '20200103', organisationUnit: 'PG', BCD1: 2, BCD2: -1 },
      ]),
    );
  });

  it('can group by a multiple fields', async () => {
    const transform = buildTestTransform([
      {
        transform: 'mergeRows',
        groupBy: ['organisationUnit', 'period'],
        using: 'sum',
      },
    ]);
    expect(await transform(TransformTable.fromRows(MERGEABLE_ANALYTICS))).toStrictEqual(
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

  it('can perform different merge strategies on different fields', async () => {
    const transform = buildTestTransform([
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
    expect(await transform(TransformTable.fromRows(MERGEABLE_ANALYTICS))).toStrictEqual(
      TransformTable.fromRows([
        { period: '20200103', organisationUnit: 'TO', BCD1: 11, BCD2: 0 },
        { period: '20200103', organisationUnit: 'PG', BCD1: 17, BCD2: -1 },
      ]),
    );
  });

  describe('merge strategies', () => {
    it('sum', async () => {
      const transform = buildTestTransform([
        {
          transform: 'mergeRows',
          groupBy: 'organisationUnit',
          using: {
            period: 'first',
            '*': 'sum',
          },
        },
      ]);
      expect(await transform(TransformTable.fromRows(MERGEABLE_ANALYTICS))).toStrictEqual(
        TransformTable.fromRows([
          { period: '20200101', organisationUnit: 'TO', BCD1: 11, BCD2: 12 },
          { period: '20200101', organisationUnit: 'PG', BCD1: 17, BCD2: 111 },
        ]),
      );
    });

    it('sum -> exclude null values', async () => {
      const transform = buildTestTransform([
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
        await transform(
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

    it('average', async () => {
      const transform = buildTestTransform([
        {
          transform: 'mergeRows',
          groupBy: 'organisationUnit',
          using: {
            period: 'first',
            '*': 'average',
          },
        },
      ]);
      expect(await transform(TransformTable.fromRows(MERGEABLE_ANALYTICS))).toStrictEqual(
        TransformTable.fromRows([
          { period: '20200101', organisationUnit: 'TO', BCD1: 3.6666666666666665, BCD2: 4 },
          { period: '20200101', organisationUnit: 'PG', BCD1: 5.666666666666667, BCD2: 37 },
        ]),
      );
    });

    it('count', async () => {
      const transform = buildTestTransform([
        {
          transform: 'mergeRows',
          groupBy: 'period',
          using: 'count',
        },
      ]);
      expect(await transform(TransformTable.fromRows(MERGEABLE_ANALYTICS))).toStrictEqual(
        TransformTable.fromRows([
          { period: '20200101', organisationUnit: 4, BCD1: 2, BCD2: 2 },
          { period: '20200102', organisationUnit: 4, BCD1: 2, BCD2: 2 },
          { period: '20200103', organisationUnit: 4, BCD1: 2, BCD2: 2 },
        ]),
      );
    });

    it('max', async () => {
      const transform = buildTestTransform([
        {
          transform: 'mergeRows',
          groupBy: 'organisationUnit',
          using: 'max',
        },
      ]);
      expect(await transform(TransformTable.fromRows(MERGEABLE_ANALYTICS))).toStrictEqual(
        TransformTable.fromRows([
          { period: '20200103', organisationUnit: 'TO', BCD1: 5, BCD2: 11 },
          { period: '20200103', organisationUnit: 'PG', BCD1: 8, BCD2: 99 },
        ]),
      );
    });

    it('min', async () => {
      const transform = buildTestTransform([
        {
          transform: 'mergeRows',
          groupBy: 'period',
          using: 'min',
        },
      ]);
      expect(await transform(TransformTable.fromRows(MERGEABLE_ANALYTICS))).toStrictEqual(
        TransformTable.fromRows([
          { period: '20200101', organisationUnit: 'PG', BCD1: 4, BCD2: 11 },
          { period: '20200102', organisationUnit: 'PG', BCD1: 2, BCD2: 1 },
          { period: '20200103', organisationUnit: 'PG', BCD1: 2, BCD2: -1 },
        ]),
      );
    });

    it('min -> consider null as minimum', async () => {
      const transform = buildTestTransform([
        {
          transform: 'mergeRows',
          groupBy: 'period',
          using: 'min',
        },
      ]);
      expect(
        await transform(
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

    it('unique', async () => {
      const transform = buildTestTransform([
        {
          transform: 'mergeRows',
          groupBy: 'organisationUnit',
          using: 'unique',
        },
      ]);
      expect(await transform(TransformTable.fromRows(UNIQUE_MERGEABLE_ANALYTICS))).toStrictEqual(
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

    it('exclude', async () => {
      const transform = buildTestTransform([
        {
          transform: 'mergeRows',
          groupBy: 'period',
          using: 'exclude',
        },
      ]);
      expect(await transform(TransformTable.fromRows(MERGEABLE_ANALYTICS))).toStrictEqual(
        TransformTable.fromRows([
          { period: '20200101' },
          { period: '20200102' },
          { period: '20200103' },
        ]),
      );
    });

    it('first', async () => {
      const transform = buildTestTransform([
        {
          transform: 'mergeRows',
          groupBy: 'organisationUnit',
          using: 'first',
        },
      ]);
      expect(await transform(TransformTable.fromRows(MERGEABLE_ANALYTICS))).toStrictEqual(
        TransformTable.fromRows([
          { period: '20200101', organisationUnit: 'TO', BCD1: 4, BCD2: 11 },
          { period: '20200101', organisationUnit: 'PG', BCD1: 7, BCD2: 13 },
        ]),
      );
    });

    it('last', async () => {
      const transform = buildTestTransform([
        {
          transform: 'mergeRows',
          groupBy: 'period',
          using: 'last',
        },
      ]);
      expect(await transform(TransformTable.fromRows(MERGEABLE_ANALYTICS))).toStrictEqual(
        TransformTable.fromRows([
          { period: '20200101', organisationUnit: 'PG', BCD1: 7, BCD2: 13 },
          { period: '20200102', organisationUnit: 'PG', BCD1: 8, BCD2: 99 },
          { period: '20200103', organisationUnit: 'PG', BCD1: 2, BCD2: -1 },
        ]),
      );
    });

    describe('single', () => {
      it('throws error is multiple values exist per group', async () => {
        const transform = buildTestTransform([
          {
            transform: 'mergeRows',
            groupBy: 'period',
            using: 'single',
          },
        ]);
        await expect(transform(TransformTable.fromRows(MERGEABLE_ANALYTICS))).rejects.toThrow();
      });

      it('returns the value if a single value exists per group', async () => {
        const transform = buildTestTransform([
          {
            transform: 'mergeRows',
            groupBy: 'period',
            using: 'single',
          },
        ]);
        expect(await transform(TransformTable.fromRows(SINGLE_MERGEABLE_ANALYTICS))).toStrictEqual(
          TransformTable.fromRows([{ period: '20200101', BCD1: 4, BCD2: 4, BCD3: 4 }]),
        );
      });
    });
  });
});
