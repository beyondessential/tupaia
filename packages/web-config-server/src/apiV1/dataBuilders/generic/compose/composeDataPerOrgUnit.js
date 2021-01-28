import { fetchComposedData } from '/apiV1/dataBuilders/helpers';

/**
 * Configuration schema
 * @typedef {Object} ComposePercentagesPerPeriodConfig
 * @property {Object<string, { dataBuilder, dataBuilderConfig }>} dataBuilders
 *
 * Example:
 * ```
 * {
 *   "dataBuilders": {
 *    "RDT positive cases": {
 *       "dataBuilder": "countEvents",
 *       "dataBuilderConfig": "<CONFIG1>",
 *     },
 *     "# febrile illness cases": {
 *       "dataBuilder": "countEvents",
 *       "dataBuilderConfig": "<CONFIG2>"
 *     }
 *   }
 * }
 * ```
 */

export const composeDataPerOrgUnit = async (config, aggregator, dhisApi) => {
  const responses = await fetchComposedData(config, aggregator, dhisApi);

  const dataByOrgUnit = {};
  const processDataItem = (builderKey, dataItem) => {
    const { value, ...newDataItem } = dataItem;
    if (value !== undefined) {
      newDataItem[builderKey] = value;
    }

    const { name } = newDataItem;
    if (!name) {
      throw new Error('composeDataPerOrgUnit must be composed of orgUnit data builders');
    }

    dataByOrgUnit[name] = {
      ...dataByOrgUnit[name],
      ...newDataItem,
    };
  };
  const processResponseEntry = ([builderKey, { data: builderData }]) => {
    builderData.forEach(dataItem => processDataItem(builderKey, dataItem));
  };
  Object.entries(responses).forEach(processResponseEntry);

  return { data: Object.values(dataByOrgUnit) };
};
