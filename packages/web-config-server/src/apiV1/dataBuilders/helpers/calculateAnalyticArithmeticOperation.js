import { divideValues } from './divideValues';

const ARITHMETIC_OPERATOR = {
  DIVIDE: 'DIVIDE',
  SUBTRACT: 'SUBTRACT',
};

const calculateOperationPart = (analytics, dataValues) => {
  let sum = 0;

  analytics.forEach(({ dataElement, value }) => {
    if (dataValues.includes(dataElement)) {
      sum += value || 0;
    }
  });

  return sum;
};

export const calculateAnalyticArithmeticOperation = (analytics, arithmeticConfig) => {
  const { operator, firstOperand, secondOperand } = arithmeticConfig;
  const firstResult = calculateOperationPart(analytics, firstOperand.dataValues);
  const secondResult = calculateOperationPart(analytics, secondOperand.dataValues);

  switch (operator) {
    case ARITHMETIC_OPERATOR.DIVIDE:
      return divideValues(firstResult, secondResult);
    case ARITHMETIC_OPERATOR.SUBTRACT:
      return firstResult - secondResult;
    default:
      throw new Error(`Cannot find operator: ${operator}`);
  }
};
