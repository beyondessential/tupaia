/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

// TODO: The code in this file is to implement a hacky approach to fetch indicator values
// because the normal analytics/rawData.json endpoint does not return any data for indicators.
// Will have to implement this properly with #tupaia-backlog/issues/2412
// After that remove this file and anything related to it

import { periodFromAnalytics } from '@tupaia/aggregator';
import { convertDateRangeToPeriodQueryString, getDefaultPeriod } from '../../../utils';
import { translateElementInDhisAggregatedAnalytics } from './translateDhisAggregatedAnalytics';
import { buildAnalyticsFromDhisAnalytics } from './buildAnalyticsFromDhisAggregatedAnalytics';

export const fetchAggregatedAnalyticsByDhisIds = async (
  models,
  dhisApi,
  dataElementCodes,
  query,
  entityAggregation,
) => {
  const dataElements = await models.dataSource.find({
    code: dataElementCodes,
    type: 'dataElement',
  });
  // Need to find all the data source org unit levels for the aggregated analytics endpoint,
  // otherwise all the data will be aggregated to the org unit
  const dataSourceEntities = entityAggregation ? (await dhisApi.fetchDataSourceEntities(
    query.organisationUnitCode,
    entityAggregation,
  )) : [(await models.entity.findOne({code: query.organisationUnitCode}))];
  const entityCodes = dataSourceEntities.map(({ code }) => code);
  const mappings = await models.dataServiceEntity.find({ entity_code: entityCodes });
  const entityIdToCode = {};
  const dataElementIdToCode = {};

  for (const dataElement of dataElements) {
    if (!dataElement.config.dhisId) {
      throw new Error('Data element does not have dhisId');
    }
    dataElementIdToCode[dataElement.config.dhisId] = dataElement.code;
  }

  for (const entityCode of entityCodes) {
    const mapping = mappings.find(m => m.entity_code === entityCode);
    if (!mapping) {
      throw new Error('Org Unit not found in data_service_entity');
    }
    if (!mapping.config.dhis_id) {
      throw new Error('Mapping config in data_service_entity does not include required dhis_id');
    }
    entityIdToCode[mapping.config.dhis_id] = entityCode;
  }

  return getAggregatedAnalytics(query, dhisApi, dataElementIdToCode, entityIdToCode);
};

const getQueryInput = (query, dataElementIds, organisationUnitIds) => {
  const period =
    query.period ||
    (convertDateRangeToPeriodQueryString(query.startDate, query.endDate) ?? getDefaultPeriod());

  return {
    dataElementIds,
    organisationUnitIds,
    outputIdScheme: 'uid',
    inputIdScheme: 'uid',
    period,
    startDate: query.startDate,
    endDate: query.endDate,
    additionalDimensions: [],
  };
};

const getAggregatedAnalytics = async (query, dhisApi, dataElementIdToCode, entityIdToCode) => {
  const queryInput = getQueryInput(
    query,
    Object.keys(dataElementIdToCode),
    Object.keys(entityIdToCode),
  );
  const response = await dhisApi.getAggregatedAnalytics(queryInput);

  let translatedResponse = translateElementInDhisAggregatedAnalytics(
    response,
    dataElementIdToCode,
    'dx',
  );
  translatedResponse = translateElementInDhisAggregatedAnalytics(
    translatedResponse,
    entityIdToCode,
    'ou',
  );

  const { results, metadata } = buildAnalyticsFromDhisAnalytics(translatedResponse);
  return {
    results,
    metadata,
    period: periodFromAnalytics(results, queryInput),
  };
};
