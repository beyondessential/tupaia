import { isPlainObject } from 'es-toolkit/compat';

const OPERATOR_TO_VALUE_CHECK = {
  '=': (value, target) => value === target,
  '>=': (value, target) => value >= target,
  '<=': (value, target) => value <= target,
  '>': (value, target) => value > target,
  '<': (value, target) => value < target,
  '<>': (value, target) => value !== target,
  range: (value, target) => target[0] <= value && value <= target[1],
  rangeExclusive: (value, target) => target[0] < value && value < target[1],
  regex: (value, target) => !!value.match(target),
  in: (value, target) => target.includes(value),
};

const NUMERIC_OPERATORS = ['>=', '<=', '>', '<', 'range', 'rangeExclusive'];

const ANY_VALUE_CONDITION = '*';

/**
 * @typedef {object} ConditionObject
 * @property {string} operator - The operator to use
 * @property {any} value - The target value, type depends on the operator
 *
 * @param {string | number} value The value to be checked
 * @param {ConditionObject | string | number} condition The condition to check against
 */
export const checkValueSatisfiesCondition = (value, condition) => {
  if (value === undefined) return false;

  if (!isPlainObject(condition)) {
    return (condition === ANY_VALUE_CONDITION && value !== '') || value === condition;
  }

  // Handle empty condition Object {}
  if (Object.keys(condition).length < 1) return true;

  const { operator, value: targetValue } = condition;

  const checkValue = OPERATOR_TO_VALUE_CHECK[operator];
  if (!checkValue) {
    throw new Error(`Unknown operator: '${operator}'`);
  }

  // Prevents '' (no data) being cast to 0 and giving incorrect results
  if (NUMERIC_OPERATORS.includes(operator) && value === '') return false;

  return checkValue(value, targetValue);
};
