/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { getUniqueEntries } from '@tupaia/utils';

const DX_BATCH_SIZE = 400;
const OU_BATCH_SIZE = 400;

const formatGroupCodes = groupCodes =>
  groupCodes.map(groupCode => `DE_GROUP-${groupCode}`).join(';');

const getDxDimension = query => {
  const { dataElementIds, dataElementCodes, dataElementGroupCodes, dataElementGroupCode } = query;

  return getUniqueEntries(
    dataElementIds ||
      dataElementCodes ||
      formatGroupCodes(dataElementGroupCodes) ||
      formatGroupCodes([dataElementGroupCode]),
  );
};

const getOuDimension = query => {
  const { organisationUnitIds, organisationUnitCode, organisationUnitCodes } = query;

  return (
    organisationUnitIds ||
    (organisationUnitCode ? [organisationUnitCode] : getUniqueEntries(organisationUnitCodes))
  );
};

const addTemporalDimension = (query, { period, startDate, endDate }) =>
  period
    ? { ...query, dimension: (query.dimension || []).concat(`pe:${period}`) }
    : { ...query, startDate, endDate };

const buildDataValueAnalyticsQuery = queryInput => {
  const {
    dx,
    ou,
    inputIdScheme = 'code',
    outputIdScheme = 'uid',
    includeMetadataDetails = true,
    additionalDimensions = ['co'],
  } = queryInput;

  const query = {
    inputIdScheme,
    outputIdScheme,
    includeMetadataDetails,
    dimension: [`dx:${dx.join(';')}`, `ou:${ou.join(';')}`, ...additionalDimensions],
  };
  return addTemporalDimension(query, queryInput);
};

export const buildDataValueAnalyticsQueries = queryInput => {
  const dx = getDxDimension(queryInput);
  const ou = getOuDimension(queryInput);

  // Fetch data in batches to avoid "Request-URI Too Large" errors
  const queries = [];
  for (let dxIndex = 0; dxIndex < dx.length; dxIndex += DX_BATCH_SIZE) {
    for (let ouIndex = 0; ouIndex < ou.length; ouIndex += OU_BATCH_SIZE) {
      queries.push(
        buildDataValueAnalyticsQuery({
          ...queryInput,
          dx: dx.slice(dxIndex, dxIndex + DX_BATCH_SIZE),
          ou: ou.slice(ouIndex, ouIndex + OU_BATCH_SIZE),
        }),
      );
    }
  }
  return queries;
};

export const buildEventAnalyticsQuery = queryInput => {
  const { dataElementIds = [], organisationUnitIds } = queryInput;
  if (!organisationUnitIds || organisationUnitIds.length === 0) {
    throw new Error('Event analytics require at least one organisation unit id');
  }

  const query = { dimension: [...dataElementIds, `ou:${organisationUnitIds.join(';')}`] };
  return addTemporalDimension(query, queryInput);
};

export const buildEventAnalyticsQueries = queryInput => {
  const { dataElementIds = [], organisationUnitIds } = queryInput;

  if (!organisationUnitIds || organisationUnitIds.length === 0) {
    throw new Error('Event analytics require at least one organisation unit id');
  }

  // Fetch data in batches to avoid "Request-URI Too Large" errors
  const queries = [];

  if (dataElementIds.length === 0) {
    // query without data elements is ok as long as it has program code
    for (let ouIndex = 0; ouIndex < organisationUnitIds.length; ouIndex += OU_BATCH_SIZE) {
      queries.push(
        buildEventAnalyticsQuery({
          ...queryInput,
          organisationUnitIds: organisationUnitIds.slice(ouIndex, ouIndex + OU_BATCH_SIZE),
        }),
      );
    }
    return queries;
  }

  for (let dxIndex = 0; dxIndex < dataElementIds.length; dxIndex += DX_BATCH_SIZE) {
    for (let ouIndex = 0; ouIndex < organisationUnitIds.length; ouIndex += OU_BATCH_SIZE) {
      queries.push(
        buildEventAnalyticsQuery({
          ...queryInput,
          dataElementIds: dataElementIds.slice(dxIndex, dxIndex + DX_BATCH_SIZE),
          organisationUnitIds: organisationUnitIds.slice(ouIndex, ouIndex + OU_BATCH_SIZE),
        }),
      );
    }
  }
  return queries;
}