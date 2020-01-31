import { AGGREGATION_TYPES } from '@tupaia/dhis-api';

export const latestAchievedVsTargetPercentage = async (
  { dataBuilderConfig, query },
  aggregator,
  dhisApi,
) => {
  const { achievedDataElementCode, targetDataElementCode } = dataBuilderConfig;
  const dataElementCodes = [achievedDataElementCode, targetDataElementCode];
  const { results, metadata } = await dhisApi.getAnalytics(
    { dataElementCodes },
    query,
    AGGREGATION_TYPES.MOST_RECENT,
  );
  if (results.length < 1) return { data: results };

  const { dataElementIdToCode } = metadata;
  const totals = results.reduce(
    (currentTotals, result) => {
      const newTotals = { ...currentTotals };
      const code = dataElementIdToCode[result.dataElement];
      if (code === achievedDataElementCode) newTotals.achieved += result.value;
      if (code === targetDataElementCode) newTotals.target += result.value;
      return newTotals;
    },
    {
      achieved: 0,
      target: 0,
    },
  );

  const percentAchieved = totals.achieved / totals.target;
  const percentRemainder = 1 - percentAchieved;
  const returnData = {
    remaining: percentRemainder,
    achieved: percentAchieved,
  };

  return { data: [returnData] };
};
