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

// Will return a map for every org unit (regardless of type) in orgUnits to its ancestor of type aggregationEntityType
const getOrgUnitToAncestorMap = async (orgUnits, aggregationEntityType, hierarchyId) => {
  if (!orgUnits || orgUnits.length === 0) return {};
  const orgUnitToAncestor = {};
  const addOrgUnitToMap = async orgUnit => {
    if (orgUnit.type !== aggregationEntityType) {
      const ancestor = await orgUnit.getAncestorOfType(aggregationEntityType, hierarchyId);
      if (ancestor) {
        orgUnitToAncestor[orgUnit.code] = { code: ancestor.code, name: ancestor.name };
      } else {
        winston.warn(`No ancestor of type ${aggregationEntityType} found for ${orgUnit.code}, hierarchyId = ${hierarchyId}`);
      }
    }
  };
  await Promise.all(orgUnits.map(orgUnit => addOrgUnitToMap(orgUnit)));
  return orgUnitToAncestor;
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
  const orgUnitMap = await getOrgUnitToAncestorMap(
    dataSourceEntities,
    aggregationEntityType,
    hierarchyId,
  );
  return { type: entityAggregationType, config: { ...entityAggregationConfig, orgUnitMap } };
};
