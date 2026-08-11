import { flatten } from 'es-toolkit/compat';

/**
 * dataPairNames must match the index order of pairs in dataElementPairs
 * dataElementPairs must have the structure:
 * [
 *  ['normalElementCode', 'currentElementCode'],
 *  ['normalElementCode', 'currentElementCode']
 *  [...]
 * ]
 *
 * presentation config must have the structure:
 * {
 *  "rowHeader": { "name": "Indicators", "color": "#efeff0"},
 *  "leftColumn": {"color": "#22c7fc", "header": "Normal"},
 *  "rightColumn": {"color": "#db2222", "header": "Current"},
 *  "dataPairNames": ["Pair 1 Name", "Pair 2 Name", ...]
 * }
 */
export const compareDataElementPairs = async ({ dataBuilderConfig, query }, aggregator) => {
  const { organisationUnitCode } = query;
  const { dataElementPairs, leftColumnHeader, rightColumnHeader, dataPairNames, dataServices } =
    dataBuilderConfig;
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
      [leftColumnHeader]: resultsByCode[pair[0]],
      [rightColumnHeader]: resultsByCode[pair[1]],
    };

    returnData.push(row);
    return returnData;
  }, []);

  return { data };
};
