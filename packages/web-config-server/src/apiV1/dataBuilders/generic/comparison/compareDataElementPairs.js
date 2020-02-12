import flatten from 'lodash.flatten';
import { AGGREGATION_TYPES } from '@tupaia/dhis-api';

/**
 * dataPairNames must match the index order of pairs in dataElementPairs
 * dataElementPairs must have the structure:
 * [
 *  ['normalElementCode', 'currentElementCode'],
 *  ['normalElementCode', 'currentElementCode']
 *  [...]
 * ]
 *
 * presentationOptions must have the structure:
 * {
 *  "rowHeader": { "name": "Indicators", "color": "#efeff0"},
 *  "leftColumn": {"color": "#22c7fc", "header": "Normal"},
 *  "rightColumn": {"color": "#db2222", "header": "Current"},
 *  "dataPairNames": ["Pair 1 Name", "Pair 2 Name", ...]
 * }
 */
export const compareDataElementPairs = async ({ dataBuilderConfig, viewJson, query }, dhisApi) => {
  const { organisationUnitCode } = query;
  const { dataElementPairs } = dataBuilderConfig;
  const { dataPairNames, leftColumn, rightColumn } = viewJson.presentationOptions;
  const { MOST_RECENT } = AGGREGATION_TYPES;

  const dataElementCodes = flatten(dataElementPairs);

  const { results, metadata } = await dhisApi.getAnalytics(
    {
      ...dataBuilderConfig,
      dataElementCodes,
    },
    {
      organisationUnitCode,
    },
    MOST_RECENT,
  );

  const resultsByCode = {};
  results.forEach(result => {
    resultsByCode[metadata.dataElementIdToCode[result.dataElement]] = result.value;
  });

  /* eslint-disable no-param-reassign */
  const data = dataElementPairs.reduce((returnData, pair, i) => {
    const row = {
      name: dataPairNames[i],
      [leftColumn.header]: resultsByCode[pair[0]],
      [rightColumn.header]: resultsByCode[pair[1]],
    };

    returnData.push(row);
    return returnData;
  }, []);
  /* eslint-enable no-param-reassign */

  return { data };
};
