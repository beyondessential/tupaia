/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

const DX_BATCH_SIZE = 750;

const formatGroupCodes = groupCodes =>
  groupCodes.map(groupCode => `DE_GROUP-${groupCode}`).join(';');

const getDxDimension = query => {
  const { dataElementCodes, dataElementGroupCodes, dataElementGroupCode } = query;

  return (
    dataElementCodes ||
    formatGroupCodes(dataElementGroupCodes) ||
    formatGroupCodes([dataElementGroupCode])
  );
};

const buildAnalyticQuery = queryInput => {
  const {
    dx,
    inputIdScheme = 'code',
    outputIdScheme = 'uid',
    includeMetadataDetails = true,
    organisationUnitCode,
    period,
    startDate,
    endDate,
  } = queryInput;

  const query = {
    inputIdScheme,
    outputIdScheme,
    includeMetadataDetails,
    dimension: [`dx:${dx.join(';')}`, `ou:${organisationUnitCode}`, 'co'],
  };

  if (period) {
    query.dimension.push(`pe:${period}`);
  } else {
    query.startDate = startDate;
    query.endDate = endDate;
  }

  return query;
};

export const buildAnalyticQueries = queryInput => {
  const dx = getDxDimension(queryInput);
  const uniqueDx = [...new Set(dx)];

  // Fetch data in batches to avoid "Request-URI Too Large" errors
  const queries = [];
  for (let i = 0; i < dx.length; i += DX_BATCH_SIZE) {
    queries.push(buildAnalyticQuery({ ...queryInput, dx: uniqueDx.slice(i, i + DX_BATCH_SIZE) }));
  }

  return queries;
};
