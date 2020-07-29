import { divideValues } from './divideValues';
import { subtractValues } from './subtractValues';

const ARITHMETIC_OPERATOR = {
  DIVIDE: 'DIVIDE',
  SUBTRACT: 'SUBTRACT',
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

const performArithmeticOperation = (operator, operands) => {
  let result = operands[0];
  let operationMethod;

  switch (operator) {
    case ARITHMETIC_OPERATOR.DIVIDE:
      operationMethod = divideValues;
      break;
    case ARITHMETIC_OPERATOR.SUBTRACT:
      operationMethod = subtractValues;
      break;
    default:
      throw new Error(`Cannot find operator: ${operator}`);
  }

  for (let i = 1; i < operands.length; i++) {
    const currentOperand = operands[i];
    result = operationMethod(result, currentOperand);
  }

  return result;
};

export const calculateArithmeticOperationForAnalytics = (analytics, arithmeticConfig) => {
  const { operator, operands: operandConfigs } = arithmeticConfig;

  if (!operandConfigs || operandConfigs.length < 2) {
    throw new Error(`Must have 2 or more operands`);
  }

  const operands = operandConfigs.map(operandConfig =>
    sumDataValues(analytics, operandConfig.dataValues),
  );

  return performArithmeticOperation(operator, operands);
};
