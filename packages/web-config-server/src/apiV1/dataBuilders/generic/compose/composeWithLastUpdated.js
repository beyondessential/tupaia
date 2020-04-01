import { fetchComposedData } from '/apiV1/dataBuilders/helpers';

/**
 * Configuration schema ???? // TODO:
 *
 * Example:
 * ```
 * {
 * "dateConfig": {
 *   "dataElementCode": "dailysurvey003"
 * },
 * "dataBuilders": {
 *   "data": {
 *     "dataBuilder": "sumLatestPerMetric",
 *     "dataBuilderConfig": {
 *       "labels": {
 *         "dailysurvey003": "New confirmed cases today",
 *         "dailysurvey004": "New deaths today"
 *       },
 *       "dataElementCodes": [
 *         "dailysurvey003",
 *         "dailysurvey004"
 *       ]
 *     }
 *   }
 * }
 *}
 * ```
 */

export const composeWithLastUpdated = async (config, aggregator, dhisApi) => {
  const { dataBuilderConfig, query } = config;
  const responses = await fetchComposedData(config, aggregator, dhisApi);
  const data = responses && responses.data.data;

  const mostRecentData = await aggregator.fetchAnalytics(
    dataBuilderConfig.dateConfig.dataElementCode,
    query,
    {
      aggregationType: 'MOST_RECENT',
    },
  );
  const lastUpdatedDate = mostRecentData ? mostRecentData.results[0].period : null;

  return { data, lastUpdatedDate };
};
