/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

const getDxString = query => {
  const { dataElementCodes, dataElementGroupCodes, dataElementGroupCode } = query;

  if (dataElementCodes) {
    return dataElementCodes.join(';');
  }
  return (dataElementGroupCodes || [dataElementGroupCode])
    .map(groupCode => `DE_GROUP-${groupCode}`)
    .join(';');
};

export const buildAnalyticsQuery = queryIn => {
  const query = {
    inputIdScheme: 'code',
    outputIdScheme: queryIn.outputIdScheme || 'uid',
    includeMetadataDetails: true,
    dimension: [`dx:${getDxString(queryIn)}`, `ou:${queryIn.organisationUnitCode}`],
  };

  if (queryIn.period) {
    query.dimension.push(`pe:${queryIn.period}`);
  } else {
    query.startDate = queryIn.startDate;
    query.endDate = queryIn.endDate;
  }

  return query;
};
