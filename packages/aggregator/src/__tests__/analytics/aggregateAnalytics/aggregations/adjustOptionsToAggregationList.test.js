import { adjustOptionsToAggregationList } from '../../../../analytics/aggregateAnalytics/adjustOptionsToAggregationList';

const getOffsetMonthsAgg = offset => ({
  type: 'OFFSET_PERIOD',
  config: { periodType: 'MONTH', offset },
});

describe('adjustOptionsToAggregationList()', () => {
  const fetchOptions = {
    organisationUnitCodes: ['TO'],
    startDate: '2020-01-01',
    endDate: '2020-02-29',
    period: '202001;202002',
  };
  const context = {
    session: { getAuthHeader: () => '' },
  };
  const testData = [
    ['empty aggregation list', {}, fetchOptions],
    ['no need for option expansion', ['FINAL_EACH_MONTH'], fetchOptions],
    [
      'options need expansion in the past',
      { aggregations: [getOffsetMonthsAgg(1)] },
      { ...fetchOptions, startDate: '2019-12-01', endDate: '2020-01-31', period: '201912;202001' },
    ],
    [
      'options need expansion in the future',
      { aggregations: [getOffsetMonthsAgg(-1)] },
      { ...fetchOptions, startDate: '2020-02-01', endDate: '2020-03-31', period: '202002;202003' },
    ],
    [
      'adjustments in the same direction',
      { aggregations: [getOffsetMonthsAgg(-1), 'FINAL_EACH_MONTH', getOffsetMonthsAgg(-2)] },
      { ...fetchOptions, startDate: '2020-04-01', endDate: '2020-05-31', period: '202004;202005' },
    ],
    [
      'adjustments in different directions: they cancel each other',
      { aggregations: [getOffsetMonthsAgg(-1), 'FINAL_EACH_MONTH', getOffsetMonthsAgg(1)] },
      fetchOptions,
    ],
    [
      'adjustments in different directions: one of them is stronger',
      { aggregations: [getOffsetMonthsAgg(1), 'FINAL_EACH_MONTH', getOffsetMonthsAgg(-3)] },
      { ...fetchOptions, startDate: '2020-03-01', endDate: '2020-04-30', period: '202003;202004' },
    ],
  ];

  it.each(testData)(
    '%s',
    async (
      _,
      aggregationOptions,
      expectedFetchOptions,
      expectedAggregationOptions = aggregationOptions,
    ) => {
      if (!aggregationOptions.aggregations || aggregationOptions.aggregations.length === 0) {
        expect(
          await adjustOptionsToAggregationList(context, fetchOptions, aggregationOptions),
        ).toStrictEqual([expectedFetchOptions, expectedAggregationOptions]);
      } else {
        expect(
          await adjustOptionsToAggregationList(context, fetchOptions, aggregationOptions),
        ).toStrictEqual([
          {
            ...expectedFetchOptions,
            aggregations: expectedAggregationOptions.aggregations,
          },
          expectedAggregationOptions,
        ]);
      }
    },
  );
});
