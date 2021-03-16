import { fetchComposedData } from '/apiV1/dataBuilders/helpers';
import { NO_DATA_AVAILABLE } from '/apiV1/dataBuilders/constants';
/**
 * Configuration schema
 * @typedef {Object} ComposeDataConfig
 * @property {string} sortOrder
 * @property {Object<string, { dataBuilder, dataBuilderConfig }>} dataBuilders
 *
 * Example:
 * ```
 * {
 *   "dataBuilders": {
 *        builder1: {
 *            sortOrder: 1,
 *            dataBuilder: <some databuilder>,
 *            dataBuilderConfig: <some config>,
 *        },
 *        builder2: {
 *            sortOrder: 2,
 *            dataBuilder: <some databuilder>,
 *            dataBuilderConfig: <some config>,
 *        }
 *    }
 * }
 * ```
 * Will return { data: [{ name: builder1, ... }, { name: builder2, ... }] }
 */

export const composeData = async (config, aggregator, dhisApi) => {
  const { dataBuilders, fillWithNoData } = config.dataBuilderConfig;
  const responses = await fetchComposedData(config, aggregator, dhisApi);

  if (Object.values(responses).every(({ data: responseData }) => containsNoData(responseData)))
    return { data: [] };

  const data = [];
  Object.entries(responses).forEach(([name, { data: responseData }]) => {
    if (containsNoData(responseData) && !fillWithNoData) return;

    const responseObj = {};
    responseData.forEach(({ name: dataPointName, value }) => {
      if (!(value === NO_DATA_AVAILABLE) || fillWithNoData) {
        responseObj[dataPointName] = value;
      }
    });
    data.push({ ...responseObj, name });
  });

  const getSortOrder = element => dataBuilders[element.name].sortOrder || 0;

  data.sort((el1, el2) => getSortOrder(el1) - getSortOrder(el2));

  return { data };
};

const containsNoData = responseData =>
  !responseData ||
  responseData.length === 0 ||
  responseData.every(({ value }) => value === NO_DATA_AVAILABLE);
