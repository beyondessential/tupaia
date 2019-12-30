/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { asynchronouslyFetchValuesForObject, getOptionSetOptions } from '/apiV1/utils';

export const countMatchingDataValuesOverTotal = async ({ dataBuilderConfig, query }, dhisApi) => {
  const { dataElementCodes, matchCriteria } = dataBuilderConfig;
  const { results, metadata } = await dhisApi.getAnalytics({ dataElementCodes }, query);

  // Fetch option set options where an option set code is defined
  const optionSetTasks = {};
  Object.entries(matchCriteria).forEach(([dataElementCode, { optionSetCode }]) => {
    if (optionSetCode) {
      optionSetTasks[dataElementCode] = () => getOptionSetOptions(dhisApi, { code: optionSetCode });
    }
  });
  const optionSetsByDataElementCode = await asynchronouslyFetchValuesForObject(optionSetTasks);

  // Map all dataElement with summed values of only operational facilities
  const summedValuesByElement = {};
  const { dataElementIdToCode, dataElementCodeToName } = metadata;
  results.forEach(({ dataElement: dataElementId, value }) => {
    const dataElementCode = dataElementIdToCode[dataElementId];
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
