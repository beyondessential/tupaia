import { uniq } from 'es-toolkit';
import { convertDateRangeToPeriodQueryString } from '@tupaia/utils';

const DX_BATCH_SIZE = 400;
const OU_BATCH_SIZE = 400;

const formatGroupCodes = groupCodes =>
  groupCodes.map(groupCode => `DE_GROUP-${groupCode}`).join(';');

const getDxDimension = query => {
  const { dataElementIds, dataElementCodes, dataElementGroupCodes, dataElementGroupCode } = query;

  return uniq(
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
    (organisationUnitCode ? [organisationUnitCode] : uniq(organisationUnitCodes))
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
    additionalDimensions = [],
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

export const buildAggregatedDataValueAnalyticsQueries = queryInput => {
  const newQueryInput = { ...queryInput };

  // 'dataPeriodType' is used when you want to force converting the periods to a specific period type.
  // Eg, if 'dataPeriodType' = 'MONTH', force converting to MONTHLY periods '201701;201702;201703;201704;...'
  // We want to use this when fetching aggregated data because:

  // All data in dhis has a date granularity,
  // e.g. you can submit an event against a full date, or just December 2018.

  // When we are fetching raw data, we can ignore this, because if we request data for 2015-2021
  // it will return all data, including an event at December 2018 because it is within that range.

  // But when we fetch aggregated data, the API behaves differently. If we request data for 2015-2021
  // it will NOT return an event at December 2018. To get the event, we have to request data for 201810 specifically.

  // This is true for both fetching data element values and fetching indicator values,
  // however, we use the raw data API endpoint most of the time, and we only use the aggregated API endpoint for indicators.
  // So practically, this is an indicator problem, but technically it's for both.
  if (newQueryInput.startDate && newQueryInput.endDate && newQueryInput.dataPeriodType) {
    newQueryInput.period = convertDateRangeToPeriodQueryString(
      newQueryInput.startDate,
      newQueryInput.endDate,
      newQueryInput.dataPeriodType,
    );
  }

  return buildDataValueAnalyticsQueries(newQueryInput);
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
};
