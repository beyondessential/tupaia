/**
 * Tupaia Config Server
 * * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import { getDataElementsInGroupSet } from '/apiV1/utils';

export const countValuesByDataElementGroup = async ({ dataBuilderConfig, query }, dhisApi) => {
  const { dataElementGroupSet } = dataBuilderConfig;
  const { dataElementGroups, dataElementToGroupMapping } = await getDataElementsInGroupSet(
    dhisApi,
    dataElementGroupSet,
  );
  const dataElementCodes = Object.values(dataElementGroups).map(({ code }) => `DE_GROUP-${code}`);
  const { results } = await dhisApi.getAnalytics({ dataElementCodes }, query);
  const dataElementGroupCounts = {};
  results.forEach(({ dataElement: dataElementId, value }) => {
    const dataElementGroupId = dataElementToGroupMapping[dataElementId];
    if (!dataElementGroupCounts[dataElementGroupId]) {
      dataElementGroupCounts[dataElementGroupId] = 0;
    }
    dataElementGroupCounts[dataElementGroupId] += value; // Because a "1" represents true, this will count one for each true data element in the case of binary
  });

  // Sort results by data element group name
  return {
    data: Object.entries(dataElementGroupCounts).map(([dataElementGroupId, count]) => ({
      name: dataElementGroups[dataElementGroupId].name,
      value: count,
    })),
  };
};
