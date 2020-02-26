export const latestAchievedVsTargetPercentage = async (
  { dataBuilderConfig, query },
  aggregator,
) => {
  const { achievedDataElementCode, targetDataElementCode, dataServices } = dataBuilderConfig;
  const dataElementCodes = [achievedDataElementCode, targetDataElementCode];
  const { results } = await aggregator.fetchAnalytics(dataElementCodes, { dataServices }, query);
  if (results.length < 1) return { data: results };

  const totals = results.reduce(
    (currentTotals, result) => {
      const newTotals = { ...currentTotals };
      const code = result.dataElement;
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
