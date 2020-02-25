import { fetchComposedData } from '/apiV1/dataBuilders/helpers';

/**
 * Configuration schema
 * @typedef {Object} ComposePercentagesPerPeriodConfig
 * @property {Object<string, DataBuilder>} dataBuilders
 *
 * Example:
 * ```
 * {
 *   dataBuilders: {
 *     febrile: {
 *       dataBuilder: "countEvents",
 *       dataBuilderConfig: {
 *         dataValues: { STR_CRF169: { operator: "regex", value: "Positive" } }
 *       }
 *     }
 *   }
 * }
 * ```
 */

export const composeDataPerPeriod = async (config, aggregator, dhisApi) => {
  const responses = await fetchComposedData(config, aggregator, dhisApi);

  const dataByTimestamp = {};
  const processDataItem = (builderKey, dataItem) => {
    const { value, ...newDataItem } = dataItem;
    if (value !== undefined) {
      newDataItem[builderKey] = value;
    }

    const { timestamp } = newDataItem;
    if (!timestamp) {
      throw new Error('composeDataPerPeriod must be composed of period data builders');
    }

    dataByTimestamp[timestamp] = {
      ...dataByTimestamp[timestamp],
      ...newDataItem,
    };
  };
  const processResponseEntry = ([builderKey, { data: builderData }]) => {
    builderData.forEach(dataItem => processDataItem(builderKey, dataItem));
  };
  Object.entries(responses).forEach(processResponseEntry);

  return { data: Object.values(dataByTimestamp) };
};
