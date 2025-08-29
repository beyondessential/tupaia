import { uniq } from 'es-toolkit';
import { groupBy, keyBy, some } from 'es-toolkit/compat';

import {
  asyncEvery,
  asyncFilter,
  checkValueSatisfiesCondition,
  comparePeriods,
  replaceValues,
} from '@tupaia/utils';

import { divideValues, fractionAndPercentage } from './divideValues';
import { subtractValues } from './subtractValues';
import { NO_DATA_AVAILABLE } from '/apiV1/dataBuilders/constants';

const checkCondition = (value, config) =>
  valueToGroup(value, { groups: { Yes: config.condition }, defaultValue: 'No' });

const formatString = (value, config) => replaceValues(config.format, { value });

const valueToGroup = (value, config) => {
  const { groups, defaultValue } = config;
  // eslint-disable-next-line no-restricted-syntax
  for (const [groupName, groupCondition] of Object.entries(groups)) {
    if (checkValueSatisfiesCondition(value, groupCondition)) return groupName;
  }
  return defaultValue;
};

const performSingleAnalyticOperation = (analytics, config, models) => {
  const { operator } = config;
  // filterKeys could be ['dataElement', 'organisationUnit'] for multiple matching key options
  const filterKeys = config.filterKeys ?? [config.dataElement];
  const filterValueMap = Object.fromEntries(filterKeys.map(key => [key, config[key]]));
  const filteredAnalytics = analytics.filter(analytic => some([analytic], filterValueMap));
  if (filteredAnalytics.length > 1) {
    throw new Error(`Too many results passed to checkConditions (calculateOperationForAnalytics)`);
  } else if (filteredAnalytics.length === 0) {
    return NO_DATA_AVAILABLE;
  }
  return OPERATORS[operator](filteredAnalytics[0].value, config, models);
};

const filterAnalytics = async (analytics, filter, models) => {
  const { parent: parentFilter, ...orgUnitFilters } = filter.organisationUnit || {};
  const orgUnitFilter =
    typeof filter.organisationUnit === 'string' ? filter.organisationUnit : orgUnitFilters;

  if (!(orgUnitFilter || parentFilter)) return analytics;

  // if filtering on parent lets pre-build a orgUnit-parent map
  const orgUnitParentMap = parentFilter
    ? await buildOrgUnitParentMapForAnalytics(analytics, models)
    : {};

  return analytics.filter(a => {
    if (parentFilter) {
      const parent = orgUnitParentMap[a.organisationUnit];
      const parentSatisfiesConditions = Object.entries(parentFilter).every(
        ([field, thisFilter]) => {
          return checkValueSatisfiesCondition(parent[field], thisFilter);
        },
      );
      if (!parentSatisfiesConditions) {
        return false;
      }
    }

    if (orgUnitFilter && !checkValueSatisfiesCondition(a.organisationUnit, orgUnitFilter))
      return false;

    return true;
  });
};

const sumDataValues = async (analytics, dataValues, filter = {}, models) => {
  let sum; // Keep sum undefined so that if there's no data values then we can distinguish between No data and 0

  const filteredAnalytics = await filterAnalytics(analytics, filter, models);
  filteredAnalytics.forEach(({ dataElement, value }) => {
    if (dataValues.includes(dataElement)) {
      sum = (sum || 0) + (value || 0);
    }
  });

  return sum;
};

const countDataValues = async (analytics, dataValues, filter, config, models) => {
  return sumDataValues(
    analytics.map(a => ({
      ...a,
      value: checkValueSatisfiesCondition(a.value, config?.countCondition || '*') ? 1 : 0,
    })),
    dataValues,
    filter,
    models,
  );
};

const buildOrgUnitParentMapForAnalytics = async (analytics, models) => {
  const orgUnits = await models.entity.find({
    code: uniq(analytics.map(a => a.organisationUnit)),
  });
  const orgUnitParents = await models.entity.find({
    id: uniq(orgUnits.map(o => o.parent_id)),
  });
  const parentIdMap = keyBy(orgUnitParents, 'id');
  const orgUnitParentMap = {};
  orgUnits.forEach(orgUnit => {
    orgUnitParentMap[orgUnit.code] = parentIdMap[orgUnit.parent_id];
  });
  return orgUnitParentMap;
};

const sumLatestDataValuePerOrgUnit = (analytics, dataValues) => {
  const analyticsByOrgUnit = groupBy(
    analytics.filter(({ dataElement }) => dataValues.includes(dataElement)),
    'organisationUnit',
  );

  const latestAnalyticByOrgUnit = Object.values(analyticsByOrgUnit).map(
    analyticsForOrgUnit =>
      analyticsForOrgUnit.sort(({ period: p1 }, { period: p2 }) => comparePeriods(p2, p1))[0],
  );

  // Sum starts as undefined so that if there's no data values then we can distinguish between No data and 0
  return latestAnalyticByOrgUnit.reduce((sum, { value }) => (sum || 0) + value, undefined);
};

const AGGREGATIONS = {
  SUM: sumDataValues,
  COUNT: countDataValues,
  SUM_LATEST_PER_ORG_UNIT: sumLatestDataValuePerOrgUnit,
};

const performArithmeticOperation = async (analytics, arithmeticConfig, models) => {
  const { operator, operands: operandConfigs, filter } = arithmeticConfig;

  if (!operandConfigs || operandConfigs.length < 2) {
    throw new Error(`Must have 2 or more operands`);
  }

  const operands = await Promise.all(
    operandConfigs.map(({ dataValues, aggregationType = 'SUM', aggregationConfig }) => {
      if (aggregationType && !AGGREGATIONS[aggregationType])
        throw new Error(`aggregation not found: ${aggregationType}`);
      return AGGREGATIONS[aggregationType](
        analytics,
        dataValues,
        filter,
        aggregationConfig,
        models,
      );
    }),
  );

  let result = operands[0];
  const operationMethod = OPERATORS[operator];

  for (let i = 1; i < operands.length; i++) {
    const currentOperand = operands[i];
    result = operationMethod(result, currentOperand);
  }

  return result;
};

const combineBinaryIndicatorsToString = (analytics, config) => {
  const { dataElementToString, delimiter = ', ' } = config;
  const filteredAnalytics = analytics.filter(({ dataElement: de }) =>
    Object.keys(dataElementToString).includes(de),
  );
  const stringArray = [];
  filteredAnalytics.forEach(({ dataElement, value }) => {
    let stringValue;

    if (typeof dataElementToString[dataElement] === 'object') {
      const { valueOfInterest, displayString } = dataElementToString[dataElement];
      if (valueOfInterest === value) {
        stringValue = displayString;
      }
    } else {
      stringValue = value === 1 ? dataElementToString[dataElement] : '';
    }

    if (stringValue) {
      stringArray.push(stringValue);
    }
  });
  return stringArray.length === 0 ? 'None' : stringArray.join(delimiter);
};

const combineTextIndicators = (analytics, config) => {
  const { dataElements } = config;
  const filteredAnalytics = analytics.filter(({ dataElement: de }) => dataElements.includes(de));
  const stringArray = [];
  filteredAnalytics.forEach(({ value }) => {
    if (value) {
      stringArray.push(value);
    }
  });
  return stringArray.length === 0 ? 'None' : stringArray.join(', ');
};

const getMetaDataFromOrgUnit = async (_, config, models) => {
  const { orgUnitCode, ancestorType, hierarchyId } = config;
  const baseEntity = await models.entity.findOne({ code: orgUnitCode });
  if (!baseEntity) return 'Entity not found';
  const entity = ancestorType
    ? await baseEntity.getAncestorOfType(hierarchyId, ancestorType)
    : baseEntity;

  return getValueFromEntity(entity, config);
};

const getValueFromEntity = async (entity, config) => {
  const { field, conditions, hierarchyId } = config;

  switch (field) {
    case 'subType':
      return entity.attributes.type;
    case 'coordinates': {
      const [lat, long] = entity.getPoint();
      return `${lat}, ${long}`;
    }
    case '$countDescendantsMatchingConditions': {
      const allDescendants = await entity.getDescendants(hierarchyId);
      const descendantsMatchingConditions = await asyncFilter(allDescendants, descendant =>
        asyncEvery(
          conditions,
          async condition => (await getValueFromEntity(descendant, condition)) === condition.value,
        ),
      );
      return descendantsMatchingConditions.length;
    }
    default:
      return (entity && entity[field]) || '';
  }
};

const staticValueOrNoData = async (analytics, config) => {
  const { value, noDataValue = NO_DATA_AVAILABLE, dataElement, filter } = config;
  if (!dataElement) return value;
  const analyticsCount = await countDataValues(analytics, [dataElement], filter);
  return analyticsCount > 0 ? value : noDataValue;
};

const countCondition = async (analytics, config, models) => {
  const { value, dataElement, filter, aggregationConfig } = config;
  if (!dataElement) return value;

  const analyticsCount = await countDataValues(
    analytics,
    dataElement,
    filter,
    aggregationConfig,
    models,
  );

  return analyticsCount;
};

const OPERATORS = {
  DIVIDE: divideValues,
  FRACTION_AND_PERCENTAGE: fractionAndPercentage,
  SUBTRACT: subtractValues,
  CHECK_CONDITION: checkCondition,
  COUNT_CONDITION: countCondition,
  GROUP: valueToGroup,
  FORMAT: formatString,
  COMBINE_BINARY_AS_STRING: combineBinaryIndicatorsToString,
  COMBINE_TEXT: combineTextIndicators,
  ORG_UNIT_METADATA: getMetaDataFromOrgUnit,
  STATIC: staticValueOrNoData,
};

const SINGLE_ANALYTIC_OPERATORS = ['CHECK_CONDITION', 'FORMAT', 'GROUP'];

const ARITHMETIC_OPERATORS = ['DIVIDE', 'SUBTRACT', 'FRACTION_AND_PERCENTAGE'];

export const getDataElementsFromCalculateOperationConfig = config =>
  config.dataElement || // Single dataElement
  config.dataElements ||
  (config.operands && config.operands.map(operand => operand.dataValues)) || // Arithmetic operators
  (config.dataElementToString && Object.keys(config.dataElementToString)) || // COMBINE_BINARY_AS_STRING
  [];

export const calculateOperationForAnalytics = async (models, analytics, config) => {
  const { operator } = config;
  if (SINGLE_ANALYTIC_OPERATORS.includes(operator)) {
    return performSingleAnalyticOperation(analytics, config, models);
  }
  if (ARITHMETIC_OPERATORS.includes(operator)) {
    return performArithmeticOperation(analytics, config, models);
  }
  if (Object.keys(OPERATORS).includes(operator)) {
    return OPERATORS[operator](analytics, config, models);
  }
  throw new Error(`Cannot find operator: ${operator}`);
};
