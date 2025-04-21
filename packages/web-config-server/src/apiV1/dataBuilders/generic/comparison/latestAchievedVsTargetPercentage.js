export const latestAchievedVsTargetPercentage = async (
  { dataBuilderConfig, query },
  aggregator,
) => {
  const { achievedDataElementCode, targetDataElementCode, dataServices } = dataBuilderConfig;
  const dataElementCodes = [achievedDataElementCode, targetDataElementCode];
  const { results } = await aggregator.fetchAnalytics(dataElementCodes, { dataServices }, query);
  if (results.length < 1) return { data: results };

  const totals = results.reduce(
    (totals, result) => {
      const code = result.dataElement;
      if (code === achievedDataElementCode) totals.achieved += result.value;
      if (code === targetDataElementCode) totals.target += result.value;
      return totals;
    },
    {
      achieved: 0,
      target: 0,
    },
  );
  if (totals.target === 0) return { data: [] };

  const percentAchieved = totals.achieved / totals.target;
  const percentRemainder = 1 - percentAchieved;
  const returnData = {
    remaining: percentRemainder,
    achieved: percentAchieved,
  };

  return { data: [returnData] };
};
