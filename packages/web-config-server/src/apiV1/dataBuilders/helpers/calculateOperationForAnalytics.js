import { checkValueSatisfiesCondition, replaceValues } from '@tupaia/utils';
import { NO_DATA_AVAILABLE } from '/apiV1/dataBuilders/constants';
import { divideValues } from './divideValues';
import { subtractValues } from './subtractValues';
import { translateBoundsForFrontend, translatePointForFrontend } from '/utils/geoJson';
import { Entity } from '/models';

const checkCondition = (value, config) =>
  valueToGroup(value, { groups: { Yes: config.condition }, defaultValue: 'No' });

const formatString = (value, config) => replaceValues(config.format, { value });

const valueToGroup = (value, config) => {
  const { groups, defaultValue } = config;
  // eslint-disable-next-line no-restricted-syntax
  for (const [groupName, groupCondition] of Object.entries(groups)) {
    console.log([groupName, groupCondition]);
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

const sumDataValues = (analytics, dataValues) => {
  let sum; //Keep sum undefined so that if there's no data values then we can distinguish between No data and 0

  analytics.forEach(({ dataElement, value }) => {
    if (dataValues.includes(dataElement)) {
      sum = (sum || 0) + (value || 0);
    }
  });

  return sum;
};

const performArithmeticOperation = (analytics, arithmeticConfig) => {
  const { operator, operands: operandConfigs } = arithmeticConfig;

  if (!operandConfigs || operandConfigs.length < 2) {
    throw new Error(`Must have 2 or more operands`);
  }

  const operands = operandConfigs.map(operandConfig =>
    sumDataValues(analytics, operandConfig.dataValues),
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
  const { dataElementToString } = config;
  const filteredAnalytics = analytics.filter(({ dataElement: de }) =>
    Object.keys(dataElementToString).includes(de),
  );
  const stringArray = [];
  filteredAnalytics.forEach(({ dataElement, value }) => {
    const stringValue = value === 'Yes' ? dataElementToString[dataElement] : '';

    if (stringValue) {
      stringArray.push(stringValue);
    }
  });
  return stringArray.length === 0 ? 'None' : stringArray.join(', ');
};

const combineTextIndicators = (analytics, config) => {
  const { dataElements } = config;
  const filteredAnalytics = analytics.filter(({ dataElement: de }) => dataElements.includes(de));
  const stringArray = [];
  filteredAnalytics.forEach(({ dataElement, value }) => {
    if (value) {
      stringArray.push(value);
    }
  });
  return stringArray.length === 0 ? 'None' : stringArray.join(', ');
};

const getMetaDataFromOrgUnit = async (_, config) => {
  const { orgUnitCode, ancestorType, field, jsonPath, hierarchyId } = config;
  const baseEntity = await Entity.findOne({ code: orgUnitCode });
  if (!baseEntity) return 'Entity not found';
  const entity = ancestorType
    ? await baseEntity.getAncestorOfType(ancestorType, hierarchyId)
    : baseEntity;

  switch (field) {
    case 'type':
      return entity.attributes.type;
    case 'coordinates': {
      const [lat, long] = translatePointForFrontend(entity.point);
      return `${lat}, ${long}`;
    }
    default:
      return entity[field];
  }
};

const OPERATORS = {
  DIVIDE: divideValues,
  SUBTRACT: subtractValues,
  CHECK_CONDITION: checkCondition,
  GROUP: valueToGroup,
  FORMAT: formatString,
  COMBINE_BINARY_AS_STRING: combineBinaryIndicatorsToString,
  COMBINE_TEXT: combineTextIndicators,
  ORG_UNIT_METADATA: getMetaDataFromOrgUnit,
};

const SINGLE_ANALYTIC_OPERATORS = ['CHECK_CONDITION', 'FORMAT', 'GROUP'];

const ARITHMETIC_OPERATORS = ['DIVIDE', 'SUBTRACT'];

export const calculateOperationForAnalytics = (analytics, config) => {
  const { operator } = config;
  if (SINGLE_ANALYTIC_OPERATORS.includes(operator)) {
    return performSingleAnalyticOperation(analytics, config);
  } else if (ARITHMETIC_OPERATORS.includes(operator)) {
    return performArithmeticOperation(analytics, config);
  } else if (Object.keys(OPERATORS).includes(operator)) {
    return OPERATORS[operator](analytics, config);
  }
  throw new Error(`Cannot find operator: ${operator}`);
};
