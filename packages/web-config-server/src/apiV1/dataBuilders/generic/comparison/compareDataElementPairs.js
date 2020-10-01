import flatten from 'lodash.flatten';

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
export const compareDataElementPairs = async (
  { dataBuilderConfig, viewJson, query },
  aggregator,
) => {
  const { organisationUnitCode } = query;
  const { dataElementPairs, dataServices } = dataBuilderConfig;
  const { dataPairNames, leftColumn, rightColumn } = viewJson.presentationOptions;

  const dataElementCodes = flatten(dataElementPairs);

  const { results } = await aggregator.fetchAnalytics(
    dataElementCodes,
    { dataServices },
    { organisationUnitCode },
  );

  const resultsByCode = {};
  results.forEach(({ dataElement: dataElementCode, value }) => {
    resultsByCode[dataElementCode] = value;
  });

  const data = dataElementPairs.reduce((returnData, pair, i) => {
    const row = {
      name: dataPairNames[i],
      [leftColumn.header]: resultsByCode[pair[0]],
      [rightColumn.header]: resultsByCode[pair[1]],
    };

    returnData.push(row);
    return returnData;
  }, []);

  return { data };
};
