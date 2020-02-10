/**
 * Tupaia Config Server
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */
import {
  AGGREGATION_TYPES,
  convertToPeriod,
  periodToDisplayString,
  PERIOD_TYPES,
} from '@tupaia/dhis-api';

export const sumPerDataElementGroupPerMonth = async ({ dataBuilderConfig, query }, dhisApi) => {
  const monthlySums = {};
  await Promise.all(
    dataBuilderConfig.dataElementGroups.map(async dataElementGroupCode => {
      const { results } = await dhisApi.getAnalytics(
        { dataElementCodes: [dataElementGroupCode] },
        query,
        AGGREGATION_TYPES.FINAL_EACH_MONTH,
      );
      results.forEach(({ period, value }) => {
        const month = convertToPeriod(period, PERIOD_TYPES.MONTH);
        if (!monthlySums[month]) {
          monthlySums[month] = {};
        }
        const sumsForMonth = monthlySums[month];
        if (!sumsForMonth[dataElementGroupCode]) {
          sumsForMonth[dataElementGroupCode] = 0;
        }
        sumsForMonth[dataElementGroupCode] += value;
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
