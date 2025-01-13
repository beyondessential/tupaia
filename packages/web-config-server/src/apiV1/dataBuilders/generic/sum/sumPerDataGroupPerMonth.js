import { PERIOD_TYPES } from '@tupaia/tsutils';
import { convertToPeriod, periodToDisplayString } from '@tupaia/utils';

export const sumPerDataGroupPerMonth = async ({ dataBuilderConfig, query }, aggregator) => {
  const monthlySums = {};
  const { dataGroups, dataServices } = dataBuilderConfig;

  await Promise.all(
    Object.entries(dataGroups).map(async ([groupName, dataElementCodes]) => {
      const { results } = await aggregator.fetchAnalytics(
        dataElementCodes,
        { dataServices },
        query,
        { aggregationType: aggregator.aggregationTypes.FINAL_EACH_MONTH },
      );
      results.forEach(({ period, value }) => {
        const month = convertToPeriod(period, PERIOD_TYPES.MONTH);
        if (!monthlySums[month]) {
          monthlySums[month] = {};
        }
        const sumsForMonth = monthlySums[month];
        if (!sumsForMonth[groupName]) {
          sumsForMonth[groupName] = 0;
        }
        sumsForMonth[groupName] += value;
      });
    }),
  );

  const returnData = [];
  Object.keys(monthlySums)
    .sort()
    .forEach(month => {
      returnData.push({
        name: periodToDisplayString(month),
        ...monthlySums[month],
      });
    });
  return { data: returnData };
};
