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
  const {
    aggregations,
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

  // Note aggregationType and aggregationConfig might be undefined
  const inputAggregations = aggregations || [{ type: aggregationType, config: aggregationConfig }];

  if (!shouldAggregateEntities(dataSourceEntities, aggregationEntityType)) {
    return {
      aggregations: inputAggregations,
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
        ? [...inputAggregations, entityAggregation]
        : [entityAggregation, ...inputAggregations],
    ...restOfOptions,
  };
};

const shouldAggregateEntities = (dataSourceEntities, aggregationEntityType) =>
  aggregationEntityType &&
  !(dataSourceEntities.length === 0) &&
  !dataSourceEntities.every(({ type }) => type === aggregationEntityType);

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
