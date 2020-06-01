import { fetchComposedData, divideValues } from '/apiV1/dataBuilders/helpers';

/**
 * Configuration schema
 * @typedef {Object} ComposeSinglePercentageConfig
 * @property {Object<string, { dataBuilder, dataBuilderConfig }>} dataBuilders
 *
 * Example:
 * ```
 * {
 *   "dataBuilders": {
 *        numerator: {
 *            dataBuilder: <some databuilder>,
 *            dataBuilderConfig: <some config>,
 *        },
 *        denominator: {
 *            dataBuilder: <some databuilder>,
 *            dataBuilderConfig: <some config>,
 *        }
 *    }
 * }
 * ```
 * Will return { data: [{ name: 'percentage', value: 0.5, metadata: {numerator: 2, denominator: 4} }] }
 */

export const composeSinglePercentage = async (config, aggregator, dhisApi) => {
  const responses = await fetchComposedData(config, aggregator, dhisApi);

  const denominator = responses.denominator;
  const numerator = responses.numerator;

  if (!containsData(denominator) || !containsData(denominator)) return { data: [] };

  const denominatorValue = denominator.data[0].value;
  const numeratorValue = numerator.data[0].value;

  if (denominatorValue === 0) return { data: [] };

  return {
    data: [
      {
        name: 'percentage',
        value: divideValues(numeratorValue, denominatorValue),
        value_metadata: { numerator: numeratorValue, denominator: denominatorValue },
      },
    ],
  };
};

const containsData = response =>
  response &&
  response.data &&
  response.data.length === 1 && // Only supports 1 datapoint, can change this if needed.
  !Number.isNaN(parseFloat(response.data[0].value));
