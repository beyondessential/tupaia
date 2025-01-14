import { asynchronouslyFetchValuesForObject } from '@tupaia/utils';

export const countMatchingDataValuesOverTotal = async (
  { dataBuilderConfig, query },
  aggregator,
  dhisApi,
) => {
  const { dataElementCodes, dataServices, matchCriteria } = dataBuilderConfig;
  const { results, metadata } = await aggregator.fetchAnalytics(
    dataElementCodes,
    { dataServices },
    query,
  );

  // Fetch option set options where an option set code is defined
  const optionSetTasks = {};
  Object.entries(matchCriteria).forEach(([dataElementCode, { optionSetCode }]) => {
    if (optionSetCode) {
      optionSetTasks[dataElementCode] = () => dhisApi.getOptionSetOptions({ code: optionSetCode });
    }
  });
  const optionSetsByDataElementCode = await asynchronouslyFetchValuesForObject(optionSetTasks);

  // Map all dataElement with summed values of only operational facilities
  const summedValuesByElement = {};
  const { dataElementCodeToName } = metadata;
  results.forEach(({ dataElement: dataElementCode, value }) => {
    if (!summedValuesByElement[dataElementCode]) {
      summedValuesByElement[dataElementCode] = { numberMatching: 0, total: 0 };
    }
    // If the value for this facility matches, add to the matching count
    const optionSet = optionSetsByDataElementCode[dataElementCode];
    const valueForMatching = optionSet ? optionSet[value] : value;
    const { valuesToMatch } = matchCriteria[dataElementCode];
    if (valuesToMatch.includes(valueForMatching)) {
      summedValuesByElement[dataElementCode].numberMatching++;
    }
    summedValuesByElement[dataElementCode].total++;
  });

  // Return proportion of matching data values over total data values for each data element
  return {
    data: dataElementCodes.map(dataElementCode => {
      const { numberMatching, total } = summedValuesByElement[dataElementCode] || {};
      return {
        name: dataElementCodeToName[dataElementCode],
        value: numberMatching || 0,
        total,
      };
    }),
  };
};
