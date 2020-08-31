/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import { Aggregator } from '@tupaia/aggregator';
import winston from '/log';

const ENTITY_AGGREGATION_ORDER_AFTER = 'AFTER';
const DEFAULT_ENTITY_AGGREGATION_TYPE = Aggregator.aggregationTypes.REPLACE_ORG_UNIT_WITH_ORG_GROUP;
const DEFAULT_ENTITY_AGGREGATION_ORDER = ENTITY_AGGREGATION_ORDER_AFTER;

export const buildAggregationOptions = async (
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

// Will return a map for every entity (regardless of type) in entities to its ancestor of type aggregationEntityType
const getEntityToAncestorMap = async (entities, aggregationEntityType, hierarchyId) => {
  if (!entities || entities.length === 0) return {};
  const entityToAncestor = {};
  const addEntityToMap = async entity => {
    if (entity.type !== aggregationEntityType) {
      const ancestor = await entity.getAncestorOfType(aggregationEntityType, hierarchyId);
      if (ancestor) {
        entityToAncestor[entity.code] = { code: ancestor.code, name: ancestor.name };
      } else {
        winston.warn(
          `No ancestor of type ${aggregationEntityType} found for ${entity.code}, hierarchyId = ${hierarchyId}`,
        );
      }
    }
  };
  await Promise.all(entities.map(entity => addEntityToMap(entity)));
  return entityToAncestor;
};

const shouldAggregateEntities = (dataSourceEntities, aggregationEntityType) =>
  aggregationEntityType &&
  !(dataSourceEntities.length === 0) &&
  !dataSourceEntities.every(({ type }) => type === aggregationEntityType);

const fetchEntityAggregationConfig = async (
  dataSourceEntities,
  aggregationEntityType,
  entityAggregationType = DEFAULT_ENTITY_AGGREGATION_TYPE,
  entityAggregationConfig,
  hierarchyId,
) => {
  const entityToAncestorMap = await getEntityToAncestorMap(
    dataSourceEntities,
    aggregationEntityType,
    hierarchyId,
  );
  return {
    type: entityAggregationType,
    config: { ...entityAggregationConfig, orgUnitMap: entityToAncestorMap },
  };
};
