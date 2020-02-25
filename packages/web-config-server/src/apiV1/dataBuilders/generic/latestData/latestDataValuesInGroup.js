/**
 * Used to get latest dataElement values from a group,
 * if dataElementCodes is passed through dataBuilderConfig only those elements
 * values will be returned.
 *
 * NOTE: This builder doesn't use getAnalytics, and therefore is useful
 * for retrieving answers from FreeText question types.
 */

import { getDataElementsInGroup } from '/apiV1/utils';

export const latestDataValuesInGroup = async (
  { dataBuilderConfig, query },
  aggregator,
  dhisApi,
) => {
  const { dataElementGroupCode, dataElementCodes = [] } = dataBuilderConfig;
  const dataElementsById = await getDataElementsInGroup(dhisApi, dataElementGroupCode);
  const dataValues = await dhisApi.getDataValuesInSets(dataBuilderConfig, query);

  let filteredResults;
  if (dataElementCodes.length > 0) {
    filteredResults = dataValues.filter(value =>
      dataElementCodes.includes(dataElementsById[value.dataElement].code),
    );
  } else {
    filteredResults = dataValues;
  }

  const returnData = filteredResults.map(({ dataElement, value }) => ({
    name: dataElementsById[dataElement].name,
    value,
  }));

  return { data: returnData };
};
