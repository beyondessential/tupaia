import { checkValueSatisfiesCondition } from '@tupaia/utils';
import { NO_DATA_AVAILABLE } from '/apiV1/dataBuilders/constants';
import { divideValues } from './divideValues';
import { subtractValues } from './subtractValues';

const checkCondition = (analytics, config) => {
  const { dataElement, condition } = config;
  const filteredAnalytics = analytics.filter(({ dataElement: de }) => de === dataElement);
  if (filteredAnalytics.length > 1) {
    throw new Error(`Too many results passed to checkConditions (calculateOperationForAnalytics)`);
  } else if (filteredAnalytics.length === 0) {
    return NO_DATA_AVAILABLE;
  }
  return checkValueSatisfiesCondition(filteredAnalytics[0].value, condition) ? 'Yes' : 'No';
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

const ARITHMETIC_OPERATORS = {
  DIVIDE: divideValues,
  SUBTRACT: subtractValues,
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
  const operationMethod = ARITHMETIC_OPERATORS[operator];

  for (let i = 1; i < operands.length; i++) {
    const currentOperand = operands[i];
    result = operationMethod(result, currentOperand);
  }

  return result;
};

const OTHER_OPERATORS = {
  CHECK_CONDITION: checkCondition,
};

export const calculateOperationForAnalytics = (analytics, config) => {
  const { operator } = config;
  if (operator in OTHER_OPERATORS) {
    return OTHER_OPERATORS[operator](analytics, config);
  } else if (operator in ARITHMETIC_OPERATORS) {
    return performArithmeticOperation(analytics, config);
  }
  throw new Error(`Cannot find operator: ${operator}`);
};
