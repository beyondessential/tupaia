// TODO: The code in this file is to implement a hacky approach to fetch indicator values
// because the normal analytics/rawData.json endpoint does not return any data for indicators.
// Will have to implement this properly with #tupaia-backlog/issues/2412
// After that remove this file and anything related to it

import { uniq } from 'es-toolkit';

import { periodFromAnalytics, aggregateAnalytics } from '@tupaia/aggregator';
import { convertDateRangeToPeriodQueryString } from '@tupaia/utils';
import { getDefaultPeriod } from '../../../utils';
import { translateElementInDhisAggregatedAnalytics } from './translateDhisAggregatedAnalytics';
import { buildAnalyticsFromDhisAnalytics } from './buildAnalyticsFromDhisAggregatedAnalytics';

export const fetchAggregatedAnalyticsByDhisIds = async (
  models,
  dhisApi,
  dataElementCodes,
  query,
  entityAggregation,
  hierarchyId,
) => {
  const dataElements = await models.dataElement.find({
    code: dataElementCodes,
  });
  // Need to find all the data source org unit levels for the aggregated analytics endpoint,
  // otherwise all the data will be aggregated to the org unit
  const dataSourceEntities = entityAggregation
    ? await dhisApi.fetchDataSourceEntities(query.organisationUnitCode, entityAggregation)
    : [await models.entity.findOne({ code: query.organisationUnitCode })];
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

  const analyticResults = await getAggregatedAnalytics(
    query,
    dhisApi,
    dataElementIdToCode,
    entityIdToCode,
  );

  if (entityAggregation && entityAggregation.aggregationEntityType) {
    if (!hierarchyId) {
      throw new Error('Cannot perform entity aggregation without hierarchyId');
    }

    // TODO: Another hacky block of code here to perform entity aggregation manually
    // since we need to perform entity aggregation for some vizes in Laos EOC
    // but we dont run through the Aggregator pipeline when fetching from DhisApi directly...
    // Will need to fix this asap...
    const newAnalytics = await performEntityAggregation(
      models,
      analyticResults.results,
      entityAggregation,
      hierarchyId,
    );
    return {
      ...analyticResults,
      results: newAnalytics,
    };
  }

  return analyticResults;
};

const performEntityAggregation = async (models, analytics, entityAggregation, hierarchyId) => {
  const { aggregationType = 'REPLACE_ORG_UNIT_WITH_ORG_GROUP', aggregationEntityType } =
    entityAggregation;
  const dataSourceEntityCodes = uniq(analytics.map(data => data.organisationUnit));
  const entityToAncestorMap = await models.entity.fetchAncestorDetailsByDescendantCode(
    dataSourceEntityCodes,
    hierarchyId,
    aggregationEntityType,
  );
  // Remove any analytic that does not have orgUnit in the entityToAncestorMap,
  // which means it is not a descendent of the aggregationEntityType
  const filteredAnalytics = analytics.filter(a =>
    Object.keys(entityToAncestorMap).includes(a.organisationUnit),
  );
  const aggregationConfig = {
    ...entityAggregation,
    orgUnitMap: entityToAncestorMap,
  };
  return aggregateAnalytics(filteredAnalytics, aggregationType, aggregationConfig);
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
