/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import { Aggregator } from '@tupaia/aggregator';
import winston from '/log';

const DEFAULT_ENTITY_AGGREGATION_TYPE = Aggregator.aggregationTypes.REPLACE_ORG_UNIT_WITH_ORG_GROUP;

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
    aggregations: [
      // entity aggregation always happens last, this should be configurable
      ...inputAggregations,
      entityAggregation,
    ],
    ...restOfOptions,
  };
};

// Will return a map for every entity (regardless of type) in entities to its ancestor of type aggregationEntityType
const ANCESTOR_FETCH_BATCH_SIZE = 1000;
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
  for (let i = 0; i < entities.length; i += ANCESTOR_FETCH_BATCH_SIZE) {
    const batchOfEntities = entities.slice(i, i + ANCESTOR_FETCH_BATCH_SIZE);
    await Promise.all(batchOfEntities.map(entity => addEntityToMap(entity)));
  }
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
