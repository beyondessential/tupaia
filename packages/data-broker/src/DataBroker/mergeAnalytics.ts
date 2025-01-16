import { Analytic, RawAnalyticResults } from '../types';

export interface AnalyticResults {
  results: {
    analytics: Analytic[];
    numAggregationsProcessed: number;
  }[];
  metadata: {
    dataElementCodeToName: Record<string, string>;
  };
}

export const mergeAnalytics = (
  target: AnalyticResults,
  source: RawAnalyticResults,
): AnalyticResults => {
  const sourceNumAggregationsProcessed = source.numAggregationsProcessed || 0;
  const targetResults = target.results;

  // Result analytics can be combined if they've processed aggregations to the same level
  const matchingResultIndex = targetResults.findIndex(
    ({ numAggregationsProcessed }) => numAggregationsProcessed === sourceNumAggregationsProcessed,
  );

  let newResults;
  if (matchingResultIndex >= 0) {
    // Found a matching result, combine the matching result analytics and the new analytics
    const matchingResult = targetResults[matchingResultIndex];
    newResults = targetResults
      .slice(0, matchingResultIndex)
      .concat([
        {
          ...matchingResult,
          analytics: matchingResult.analytics.concat(source.results),
        },
      ])
      .concat(targetResults.slice(matchingResultIndex + 1, targetResults.length - 1));
  } else {
    // No matching result, just append this result to previous results
    newResults = targetResults.concat([
      { analytics: source.results, numAggregationsProcessed: sourceNumAggregationsProcessed },
    ]);
  }

  return {
    results: newResults,
    metadata: {
      dataElementCodeToName: {
        ...target.metadata.dataElementCodeToName,
        ...source.metadata.dataElementCodeToName,
      },
    },
  };
};
