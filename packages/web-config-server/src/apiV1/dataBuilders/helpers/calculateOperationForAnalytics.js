import {
  checkValueSatisfiesCondition,
  replaceValues,
  asyncFilter,
  asyncEvery,
} from '@tupaia/utils';
import { NO_DATA_AVAILABLE } from '/apiV1/dataBuilders/constants';
import { divideValues } from './divideValues';
import { subtractValues } from './subtractValues';
import { translatePointForFrontend } from '/utils/geoJson';

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

const performSingleAnalyticOperation = (analytics, config) => {
  const { operator, dataElement } = config;
  const filteredAnalytics = analytics.filter(({ dataElement: de }) => de === dataElement);
  if (filteredAnalytics.length > 1) {
    throw new Error(`Too many results passed to checkConditions (calculateOperationForAnalytics)`);
  } else if (filteredAnalytics.length === 0) {
    return NO_DATA_AVAILABLE;
  }
  return OPERATORS[operator](filteredAnalytics[0].value, config);
};

const sumDataValues = (analytics, dataValues, filter = {}) => {
  let sum; // Keep sum undefined so that if there's no data values then we can distinguish between No data and 0
  const { organisationUnit: organisationUnitFilter } = filter;

  analytics.forEach(({ dataElement, value, organisationUnit }) => {
    if (
      organisationUnitFilter &&
      !checkValueSatisfiesCondition(organisationUnit, organisationUnitFilter)
    )
      return;

    if (dataValues.includes(dataElement)) {
      sum = (sum || 0) + (value || 0);
    }
  });

  return sum;
};

const countDataValues = (analytics, dataValues, filter, config) =>
  sumDataValues(
    analytics.map(a => ({
      ...a,
      value: checkValueSatisfiesCondition(a.value, config?.countCondition || '*') ? 1 : 0,
    })),
    dataValues,
    filter,
  );

const AGGREGATIONS = {
  SUM: sumDataValues,
  COUNT: countDataValues,
};

const performArithmeticOperation = (analytics, arithmeticConfig) => {
  const { operator, operands: operandConfigs, filter } = arithmeticConfig;

  if (!operandConfigs || operandConfigs.length < 2) {
    throw new Error(`Must have 2 or more operands`);
  }

  const operands = operandConfigs.map(
    ({ dataValues, aggregationType = 'SUM', aggregationConfig }) => {
      if (aggregationType && !AGGREGATIONS[aggregationType])
        throw new Error(`aggregation not found: ${aggregationType}`);
      return AGGREGATIONS[aggregationType](analytics, dataValues, filter, aggregationConfig);
    },
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
      stringValue = value === 'Yes' ? dataElementToString[dataElement] : '';
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
      const [lat, long] = translatePointForFrontend(entity.point);
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
      return entity[field];
  }
};

const staticValueOrNoData = (analytics, config) => {
  const { value, noDataValue = NO_DATA_AVAILABLE, dataElement, filter } = config;
  if (!dataElement) return value;
  const analyticsCount = countDataValues(analytics, [dataElement], filter);
  return analyticsCount > 0 ? value : noDataValue;
};

const OPERATORS = {
  DIVIDE: divideValues,
  FRACTION_AND_PERCENTAGE: (numerator, divisor) =>
    (numerator || numerator === 0) && divisor
      ? `${numerator} / ${divisor} = ${Math.floor(divideValues(numerator, divisor) * 100)}%`
      : NO_DATA_AVAILABLE,
  SUBTRACT: subtractValues,
  CHECK_CONDITION: checkCondition,
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
    return performSingleAnalyticOperation(analytics, config);
  }
  if (ARITHMETIC_OPERATORS.includes(operator)) {
    return performArithmeticOperation(analytics, config);
  }
  if (Object.keys(OPERATORS).includes(operator)) {
    return OPERATORS[operator](analytics, config, models);
  }
  throw new Error(`Cannot find operator: ${operator}`);
};
