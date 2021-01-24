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

  if (!shouldAggregateEntities(dataSourceEntities, aggregationEntityType, entityAggregationType)) {
    return {
      aggregations: inputAggregations,
      ...restOfOptions,
    };
  }

  const fetchEntityAggregationConfig = getEntityAggregationConfigFetcher(entityAggregationType);
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

const shouldAggregateEntities = (
  dataSourceEntities,
  aggregationEntityType,
  entityAggregationType,
) =>
  entityAggregationType === Aggregator.aggregationTypes.REPLACE_ENTITY_ANSWER_WITH_ENTITY_NAME ||
  (aggregationEntityType &&
    !(dataSourceEntities.length === 0) &&
    !dataSourceEntities.every(({ type }) => type === aggregationEntityType) &&
    !(entityAggregationType === Aggregator.aggregationTypes.RAW));

const replaceOrgUnitWithOrgGroupConfig = async (
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

const replaceEntityAnswerWithEntityNameConfig = async (
  models,
  dataSourceEntities,
  aggregationEntityType,
  entityAggregationType,
  entityAggregationConfig,
) => {
  const entityIdToNameInAnswerMap = await entityAggregationConfig.questionCodes.reduce(
    async (acc, questionCode) => {
      const entityIdToNameMapping = await models.entity.getEntityAnswerWithEntityName(
        dataSourceEntities.map(e => e.code),
        questionCode,
      );
      return { ...acc, [questionCode]: entityIdToNameMapping };
    },
    {},
  );

  return {
    type: entityAggregationType,
    config: { ...entityAggregationConfig, answerTranslation: entityIdToNameInAnswerMap },
  };
};

const getEntityAggregationConfigFetcher = entityAggregationType =>
  entityAggregationType === Aggregator.aggregationTypes.REPLACE_ENTITY_ANSWER_WITH_ENTITY_NAME
    ? replaceEntityAnswerWithEntityNameConfig
    : replaceOrgUnitWithOrgGroupConfig;
