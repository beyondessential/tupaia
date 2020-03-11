/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

const DX_BATCH_SIZE = 400;
const OU_BATCH_SIZE = 400;

const formatGroupCodes = groupCodes =>
  groupCodes.map(groupCode => `DE_GROUP-${groupCode}`).join(';');

const getUniqueEntries = entries => [...new Set(entries)];

const getDxDimension = query => {
  const { dataElementCodes, dataElementGroupCodes, dataElementGroupCode } = query;

  return getUniqueEntries(
    dataElementCodes ||
      formatGroupCodes(dataElementGroupCodes) ||
      formatGroupCodes([dataElementGroupCode]),
  );
};

const getOuDimension = query => {
  const { organisationUnitCode, organisationUnitCodes } = query;

  return organisationUnitCode ? [organisationUnitCode] : getUniqueEntries(organisationUnitCodes);
};

const buildAnalyticQuery = queryInput => {
  const {
    dx,
    ou,
    inputIdScheme = 'code',
    outputIdScheme = 'uid',
    includeMetadataDetails = true,
    period,
    startDate,
    endDate,
  } = queryInput;

  const query = {
    inputIdScheme,
    outputIdScheme,
    includeMetadataDetails,
    dimension: [`dx:${dx.join(';')}`, `ou:${ou.join(';')}`, 'co'],
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
  const ou = getOuDimension(queryInput);

  // Fetch data in batches to avoid "Request-URI Too Large" errors
  const queries = [];
  for (let i = 0; i < dx.length; i += DX_BATCH_SIZE) {
    for (let j = 0; j < ou.length; j += OU_BATCH_SIZE) {
      queries.push(
        buildAnalyticQuery({
          ...queryInput,
          dx: dx.slice(i, i + DX_BATCH_SIZE),
          ou: ou.slice(i, i + OU_BATCH_SIZE),
        }),
      );
    }
  }

  return queries;
};
