import { getSortByKey } from '@tupaia/utils';
import { getDataElementsInGroupSet } from '/apiV1/utils';

export const countValuesByDataElementGroup = async (
  { dataBuilderConfig, query },
  aggregator,
  dhisApi,
) => {
  const { dataElementGroupSet, dataServices } = dataBuilderConfig;
  const { dataElementGroups, dataElementToGroupMapping } = await getDataElementsInGroupSet(
    dhisApi,
    dataElementGroupSet,
    true,
  );
  const dataElementCodes = Object.keys(dataElementToGroupMapping);
  const { results } = await aggregator.fetchAnalytics(dataElementCodes, { dataServices }, query);
  const dataElementGroupCounts = {};
  results.forEach(({ dataElement: dataElementCode, value }) => {
    const dataElementGroupId = dataElementToGroupMapping[dataElementCode];
    if (!dataElementGroupCounts[dataElementGroupId]) {
      dataElementGroupCounts[dataElementGroupId] = 0;
    }
    dataElementGroupCounts[dataElementGroupId] += value; // Because a "1" represents true, this will count one for each true data element in the case of binary
  });

  const data = Object.entries(dataElementGroupCounts)
    .map(([dataElementGroupId, count]) => ({
      name: dataElementGroups[dataElementGroupId].name,
      value: count,
    }))
    .sort(getSortByKey('name'));

  return { data };
};
