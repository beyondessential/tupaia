/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import { Aggregator } from '@tupaia/aggregator';
import { AncestorDescendantRelation } from '/models';

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
  const entityToAncestorMap = await AncestorDescendantRelation.getEntityCodeToAncestorMap(
    dataSourceEntities,
    hierarchyId,
    { ancestor_type: aggregationEntityType },
  );
  return {
    type: entityAggregationType,
    config: { ...entityAggregationConfig, orgUnitMap: entityToAncestorMap },
  };
};
