/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import { Aggregator } from '@tupaia/aggregator';

const DEFAULT_ENTITY_AGGREGATION_TYPE = Aggregator.aggregationTypes.REPLACE_ORG_UNIT_WITH_ORG_GROUP;

export const buildAggregationOptions = async (
  initialAggregationOptions,
  dataSourceEntities,
  query,
) => {
  const {
    aggregations,
    aggregationType,
    aggregationConfig,
    ...restOfOptions
  } = initialAggregationOptions;
  const { aggregationEntityType, aggregationType: entityAggregationType } = query;

  const inputAggregations =
    aggregations || aggregationType ? [{ type: aggregationType, config: aggregationConfig }] : [];

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
const getOrgUnitToAncestorMap = async (orgUnits, aggregationEntityType) => {
  if (!orgUnits || orgUnits.length === 0) return {};
  const orgUnitToAncestor = {};
  const addOrgUnitToMap = async orgUnit => {
    if (orgUnit && orgUnit.type !== aggregationEntityType) {
      const ancestor = await orgUnit.getAncestorOfType(aggregationEntityType);
      if (ancestor) {
        orgUnitToAncestor[orgUnit.code] = { code: ancestor.code, name: ancestor.name };
      }
    }
  };
  await Promise.all(orgUnits.map(orgUnit => addOrgUnitToMap(orgUnit)));
  return orgUnitToAncestor;
};

const shouldAggregateEntities = (dataSourceEntities, aggregationEntityType) =>
  aggregationEntityType &&
  dataSourceEntities &&
  !(dataSourceEntities.length === 0) &&
  !dataSourceEntities.every(({ type }) => type === aggregationEntityType);

const fetchEntityAggregationConfig = async (
  dataSourceEntities,
  aggregationEntityType,
  entityAggregationType = DEFAULT_ENTITY_AGGREGATION_TYPE,
) => {
  const orgUnitMap = await getOrgUnitToAncestorMap(dataSourceEntities, aggregationEntityType);
  return { type: entityAggregationType, config: { orgUnitMap } };
};
