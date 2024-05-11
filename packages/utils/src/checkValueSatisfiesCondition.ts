import isPlainObject from 'lodash.isplainobject';

const OPERATOR_TO_VALUE_CHECK: { [key: string]: (value: any, target: any) => boolean } = {
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

// TODO: swap to ActualConditionObject and rm runtime error checks when all callers migrate to ts
export type ConditionObject = {
  operator?: string;
  value?: any;
};
type ActualConditionObject = {
  operator: string;
  value: any;
};
export const checkValueSatisfiesCondition = (
  value: any,
  condition: ConditionObject | string | number,
) => {
  if (value === undefined) return false;

  if (!isPlainObject(condition)) {
    return (condition === ANY_VALUE_CONDITION && value !== '') || value === condition;
  }

  // Handle empty condition Object {}
  if (Object.keys(condition).length < 1) return true;

  const conditionObject = condition as ActualConditionObject;

  const { operator, value: targetValue } = conditionObject;

  const checkValue = OPERATOR_TO_VALUE_CHECK[operator];
  if (!checkValue) {
    throw new Error(`Unknown operator: '${operator}'`);
  }

  // Prevents '' (no data) being cast to 0 and giving incorrect results
  if (NUMERIC_OPERATORS.includes(operator) && value === '') return false;

  return checkValue(value, targetValue);
};
