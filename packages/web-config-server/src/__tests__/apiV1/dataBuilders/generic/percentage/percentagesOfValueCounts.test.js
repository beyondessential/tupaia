import { createJestMockInstance } from '@tupaia/utils';
import {
  PercentagesOfValueCountsBuilder,
  percentagesOfAllValueCounts,
  percentagesOfValueCounts,
} from '/apiV1/dataBuilders/generic/percentage/percentagesOfValueCounts';

const models = {};
const query = { organisationUnitCode: 'TO' };
const entity = {};

const ANALYTICS = [
  { dataElement: 'DE_A', organisationUnit: 'TO_Facility1', period: '20200101', value: 'Yes' },
  { dataElement: 'DE_A', organisationUnit: 'TO_Facility2', period: '20200101', value: 'No' },
  { dataElement: 'DE_B', organisationUnit: 'TO_Facility1', period: '20200101', value: 'Yes' },
  { dataElement: 'DE_C', organisationUnit: 'TO_Facility1', period: '20200101', value: 5 },
  { dataElement: 'DE_C', organisationUnit: 'TO_Facility2', period: '20200101', value: 2 },
  { dataElement: 'DE_D', organisationUnit: 'TO_Facility1', period: '20200101', value: 10 },
];

const fetchAnalytics = jest.fn().mockImplementation(dataElementCodes => ({
  results: ANALYTICS.filter(({ dataElement }) => dataElementCodes.includes(dataElement)),
}));

const aggregator = createJestMockInstance('@tupaia/aggregator', 'Aggregator', {
  fetchAnalytics,
  aggregationTypes: { RAW: 'RAW' },
});
const dhisApi = createJestMockInstance('@tupaia/dhis-api', 'DhisApi');

const getBuilder = (config, aggregationType) =>
  new PercentagesOfValueCountsBuilder(
    models,
    aggregator,
    dhisApi,
    config,
    query,
    entity,
    aggregationType,
  );

describe('PercentagesOfValueCountsBuilder', () => {
  beforeEach(() => {
    fetchAnalytics.mockClear();
  });

  describe('getDataElementCodes()', () => {
    it('collects array dataValues and deduplicates overlapping denominator codes', () => {
      const builder = getBuilder({
        dataClasses: {
          metric: {
            numerator: { dataValues: ['DE_A', 'DE_B'] },
            denominator: { dataValues: ['DE_A', 'DE_C'] },
          },
        },
      });

      expect(builder.getDataElementCodes()).toEqual({
        numerator: ['DE_B'],
        denominator: ['DE_A', 'DE_C'],
      });
    });

    it('collects object dataValues keys and ignores configs without dataValues', () => {
      const builder = getBuilder({
        dataClasses: {
          metric: {
            numerator: { dataValues: { DE_A: 'Yes' } },
            denominator: { key: '$orgUnitCount' },
          },
        },
      });

      expect(builder.getDataElementCodes()).toEqual({
        numerator: ['DE_A'],
        denominator: [],
      });
    });
  });

  describe('calculateFractionPart()', () => {
    it('counts analytics that satisfy simple value conditions', () => {
      const builder = getBuilder({ dataClasses: {} });

      expect(
        builder.calculateFractionPart({ dataValues: ['DE_A'], valueOfInterest: 'Yes' }, ANALYTICS),
      ).toBe(1);
    });

    it('counts org units when the fraction is $orgUnitCount', () => {
      const builder = getBuilder({ dataClasses: {} });

      expect(builder.calculateFractionPart('$orgUnitCount', ANALYTICS)).toBe(2);
    });

    it('applies org unit count operations when configured', () => {
      const builder = getBuilder({ dataClasses: {} });

      expect(
        builder.calculateFractionPart(
          {
            key: '$orgUnitCount',
            operationConfig: { operator: 'MULTIPLY', value: 3 },
          },
          ANALYTICS,
        ),
      ).toBe(6);
    });

    it('throws when an org unit count operator is unknown', () => {
      const builder = getBuilder({ dataClasses: {} });

      expect(() =>
        builder.operateOrgUnitCount(2, {
          operationConfig: { operator: 'UNKNOWN', value: 3 },
        }),
      ).toThrow('Cannot find this operator for org unit count operation');
    });

    it('counts grouped analytics before applying value conditions', () => {
      const builder = getBuilder({ dataClasses: {} });

      expect(
        builder.calculateFractionPart(
          {
            groupBeforeCounting: 'organisationUnit',
            dataValues: { DE_C: { operator: '>=', value: 3 } },
          },
          ANALYTICS,
        ),
      ).toBe(1);
    });

    it('compares nested value counts and returns false when the first set is empty', () => {
      const builder = getBuilder({ dataClasses: {} });

      expect(
        builder.calculateFractionPart(
          {
            compare: '$count',
            valueOfInterest: 'Yes',
            dataValues: [['DE_MISSING'], ['DE_B']],
          },
          ANALYTICS,
        ),
      ).toBe(false);
    });

    it('compares nested value counts when both sets have matching counts', () => {
      const builder = getBuilder({ dataClasses: {} });

      expect(
        builder.calculateFractionPart(
          {
            compare: '$count',
            valueOfInterest: 'Yes',
            dataValues: [['DE_A'], ['DE_B']],
          },
          ANALYTICS,
        ),
      ).toBe(true);
    });

    it('compares nested value counts when counts differ', () => {
      const builder = getBuilder({ dataClasses: {} });

      expect(
        builder.calculateFractionPart(
          {
            compare: '$count',
            valueOfInterest: 'Yes',
            dataValues: [['DE_A', 'DE_B'], ['DE_C']],
          },
          ANALYTICS,
        ),
      ).toBe(false);
    });

    it('throws when nested compare config is invalid', () => {
      const builder = getBuilder({ dataClasses: {} });

      expect(() =>
        builder.calculateFractionPart(
          {
            compare: '$count',
            valueOfInterest: 'Yes',
            dataValues: ['DE_A'],
          },
          ANALYTICS,
        ),
      ).toThrow(
        'nested array passed to: percentagesOfValueCounts must have exactly 2 sub-arrays for comparison',
      );
    });

    it('applies operation filters per analytic', () => {
      const builder = getBuilder({ dataClasses: {} });

      expect(
        builder.calculateFractionPart(
          {
            operation: 'GT',
            operand: 3,
            dataValues: ['DE_C'],
          },
          ANALYTICS,
        ),
      ).toBe(1);
    });

    it('applies operation filters to grouped analytics', () => {
      const builder = getBuilder({ dataClasses: {} });

      expect(
        builder.calculateFractionPart(
          {
            operation: 'EQ',
            operand: 5,
            groupBy: 'organisationUnit',
            dataValues: ['DE_C'],
          },
          ANALYTICS,
        ),
      ).toBe(1);
    });

    it('throws when compare and operation are both absent', () => {
      const builder = getBuilder({ dataClasses: {} });

      expect(() => builder.calculateFractionPart({ dataValues: ['DE_A'] }, ANALYTICS)).toThrow(
        'Could not parse calculation for: [object Object]',
      );
    });
  });

  describe('fetchResults()', () => {
    it('returns numerator analytics when there is no denominator', async () => {
      const builder = getBuilder({
        dataClasses: {
          metric: {
            numerator: { dataValues: ['DE_A'] },
            denominator: { key: '$orgUnitCount' },
          },
        },
      });

      await expect(builder.fetchResults()).resolves.toEqual([ANALYTICS[0], ANALYTICS[1]]);
      expect(fetchAnalytics).toHaveBeenCalledTimes(1);
    });

    it('merges denominator analytics without duplicating numerator rows', async () => {
      const builder = getBuilder({
        dataClasses: {
          metric: {
            numerator: { dataValues: ['DE_A'] },
            denominator: { dataValues: ['DE_A', 'DE_C'] },
          },
        },
      });

      await expect(builder.fetchResults()).resolves.toEqual([
        ANALYTICS[0],
        ANALYTICS[1],
        ANALYTICS[4],
        ANALYTICS[5],
      ]);
      expect(fetchAnalytics).toHaveBeenCalledTimes(2);
    });
  });

  describe('build()', () => {
    it('builds percentage data sorted by sortOrder and returns empty data when unavailable', async () => {
      const builder = getBuilder({
        dataClasses: {
          second: {
            sortOrder: 2,
            numerator: { dataValues: ['DE_MISSING'], valueOfInterest: 'Yes' },
            denominator: { dataValues: ['DE_MISSING'], valueOfInterest: '*' },
          },
          first: {
            sortOrder: 1,
            numerator: { dataValues: ['DE_A'], valueOfInterest: 'Yes' },
            denominator: { dataValues: ['DE_A'], valueOfInterest: '*' },
          },
        },
      });

      await expect(builder.build()).resolves.toEqual({
        data: [
          {
            name: 'first',
            value: 0.5,
            first_metadata: { numerator: 1, denominator: 2 },
          },
        ],
      });
    });

    it('returns an empty array when every value is unavailable', async () => {
      const builder = getBuilder({
        dataClasses: {
          metric: {
            numerator: { dataValues: ['DE_MISSING'], valueOfInterest: 'Yes' },
            denominator: { dataValues: ['DE_MISSING'], valueOfInterest: '*' },
          },
        },
      });

      await expect(builder.build()).resolves.toEqual({ data: [] });
    });
  });
});

describe('percentagesOfValueCounts exports', () => {
  it('delegates to the builder without a custom aggregation type', async () => {
    const response = await percentagesOfValueCounts(
      {
        dataBuilderConfig: {
          dataClasses: {
            metric: {
              numerator: { dataValues: ['DE_A'], valueOfInterest: 'Yes' },
              denominator: { dataValues: ['DE_A'], valueOfInterest: '*' },
            },
          },
        },
        query,
        organisationUnitInfo: entity,
        models,
      },
      aggregator,
      dhisApi,
    );

    expect(response.data[0].value).toBe(0.5);
    expect(fetchAnalytics).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.objectContaining({ aggregationType: undefined }),
    );
  });

  it('uses RAW aggregation for percentagesOfAllValueCounts', async () => {
    await percentagesOfAllValueCounts(
      {
        dataBuilderConfig: {
          dataClasses: {
            metric: {
              numerator: { dataValues: ['DE_A'], valueOfInterest: 'Yes' },
              denominator: { dataValues: ['DE_A'], valueOfInterest: '*' },
            },
          },
        },
        query,
        organisationUnitInfo: entity,
        models,
      },
      aggregator,
      dhisApi,
    );

    expect(fetchAnalytics).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.objectContaining({ aggregationType: 'RAW' }),
    );
  });
});
