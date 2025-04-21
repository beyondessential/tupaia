import set from 'lodash.set';

import { composeDataPerPeriod } from '/apiV1/dataBuilders/generic/compose/composeDataPerPeriod';
import { divideValues } from '/apiV1/dataBuilders/helpers';

/**
 * Configuration schema
 * @typedef {Object} ComposePercentagesPerPeriodConfig
 * @property {Object<string, { dataBuilder, dataBuilderConfig }>} dataBuilders
 * @property {Object<string, { numerator: string, denominator: string }>} percentages
 *
 * Example:
 * ```
 * {
 *   dataBuilders: {
 *     mrdtPositive: {
 *       dataBuilder: "countEvents",
 *       dataBuilderConfig: {
 *         dataValues: { STR_CRF169: { operator: "regex", value: "Positive" } }
 *       }
 *     },
 *     consultations: {
 *       dataBuilder: "sumPerWeek",
 *       dataBuilderConfig: { dataSource: { type: "single", codes: ["SSWT1001"] } }
 *     }
 *   },
 *   percentages: {
 *     positiveConsultations: { numerator: "mrdtPositive", denominator: "consultations" }
 *   }
 * };
 * ```
 */

/**
 * @param {Object<string, { numerator, denominator }>} percentages
 * @returns {Object<string, { dataKey, type: ('numerator'|'denominator') }>}
 */
const getValueKeyMap = percentages =>
  Object.entries(percentages).reduce((result, [dataKey, { numerator, denominator }]) => {
    result[numerator] = { dataKey, type: 'numerator' };
    result[denominator] = { dataKey, type: 'denominator' };
    return result;
  }, {});

const removeEmptyPercentages = (dataKeys, data) =>
  data.filter(dataItem => Object.keys(dataItem).some(key => dataKeys.includes(key)));

export const composePercentagesPerPeriod = async (config, aggregator, dhisApi) => {
  const { data: rawDataPerPeriod } = await composeDataPerPeriod(config, aggregator, dhisApi);
  const { percentages } = config.dataBuilderConfig;
  const valueKeyMap = getValueKeyMap(percentages);

  const data = rawDataPerPeriod.map(dataItem => {
    const newDataItem = {};
    const percentageParts = {};
    Object.entries(dataItem).forEach(([key, value]) => {
      const valueKey = valueKeyMap[key];
      if (!valueKey) {
        // Current entry is generic data (eg `timestamp`, `name`), include it in the result as is
        newDataItem[key] = value;
        return;
      }
      const { dataKey, type } = valueKey;
      set(percentageParts, [dataKey, type], value);
    });

    Object.entries(percentageParts).forEach(([dataKey, { numerator, denominator }]) => {
      const fraction = divideValues(numerator, denominator);
      if (!isNaN(fraction)) {
        newDataItem[dataKey] = fraction;
        newDataItem[`${dataKey}_metadata`] = { numerator, denominator };
      }
    });

    return newDataItem;
  });
  const filteredData = removeEmptyPercentages(Object.keys(percentages), data);

  return { data: filteredData };
};
