/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import { Aggregator } from '@tupaia/aggregator';

const ENTITY_AGGREGATION_ORDER_AFTER = 'AFTER';
const DEFAULT_ENTITY_AGGREGATION_TYPE = Aggregator.aggregationTypes.REPLACE_ORG_UNIT_WITH_ORG_GROUP;
const DEFAULT_ENTITY_AGGREGATION_ORDER = ENTITY_AGGREGATION_ORDER_AFTER;

export const buildAggregationOptions = async (
  models,
  initialAggregationOptions,
  dataSourceEntities = [],
  entityAggregationOptions,
  hierarchyId,
) => {
  // default to using the single aggregationType if no series of aggregations is defined
  const defaultAggregation = { type: aggregationType, config: aggregationConfig };
  const {
    aggregations: inputAggregations = [defaultAggregation],
    aggregationType,
    aggregationConfig,
    ...restOfOptions
  } = initialAggregationOptions;
  const {
    aggregationEntityType,
    aggregationType: entityAggregationType,
    aggregationConfig: entityAggregationConfig,
    aggregationOrder: entityAggregationOrder = DEFAULT_ENTITY_AGGREGATION_ORDER,
  } = entityAggregationOptions;

  // filter out any undefined aggregation types - most commonly the default single aggregation type
  // was not defined
  const aggregations = inputAggregations.filter(a => !!a.type);

  if (!shouldAggregateEntities(dataSourceEntities, aggregationEntityType, entityAggregationType)) {
    return {
      aggregations,
      ...restOfOptions,
    };
  }

  const entityAggregation = await fetchEntityAggregationConfig(
    models,
    dataSourceEntities,
    aggregationEntityType,
    entityAggregationType,
    entityAggregationConfig,
    hierarchyId,
  );

  return {
    aggregations:
      entityAggregationOrder === ENTITY_AGGREGATION_ORDER_AFTER
        ? [...aggregations, entityAggregation]
        : [entityAggregation, ...aggregations],
    ...restOfOptions,
  };
};

const shouldAggregateEntities = (
  dataSourceEntities,
  aggregationEntityType,
  entityAggregationType,
) =>
  aggregationEntityType &&
  !(dataSourceEntities.length === 0) &&
  !dataSourceEntities.every(({ type }) => type === aggregationEntityType) &&
  !(entityAggregationType === Aggregator.aggregationTypes.RAW);

const fetchEntityAggregationConfig = async (
  models,
  dataSourceEntities,
  aggregationEntityType,
  entityAggregationType = DEFAULT_ENTITY_AGGREGATION_TYPE,
  entityAggregationConfig,
  hierarchyId,
) => {
  const entityToAncestorMap = await models.entity.fetchAncestorDetailsByDescendantCode(
    dataSourceEntities.map(e => e.code),
    hierarchyId,
    aggregationEntityType,
  );
  return {
    type: entityAggregationType,
    config: { ...entityAggregationConfig, orgUnitMap: entityToAncestorMap },
  };
};
