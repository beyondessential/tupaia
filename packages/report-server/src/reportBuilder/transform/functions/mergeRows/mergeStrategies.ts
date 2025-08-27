import { isDefined, isNotNullish } from '@tupaia/tsutils';
import { FieldValue } from '../../../types';

// checkIsNum([1, 2, 3, null, undefined]) = 1, 2, 3]
const checkIsNum = (values: FieldValue[]): number[] => {
  const assertIsNumber = (value: FieldValue): value is number => {
    if (typeof value !== 'number') {
      throw new Error(`Expected number, got '${typeof value}'. Value was: ${value}`);
    }
    return true;
  };
  const filteredUndefinedAndNullValues = values.filter(isNotNullish);
  return filteredUndefinedAndNullValues.filter(assertIsNumber);
};

const group = (values: FieldValue[]): FieldValue => {
  return values[0];
};

const sum = (values: FieldValue[]): number | undefined => {
  const checkedValues = checkIsNum(values);
  return checkedValues.length === 0
    ? undefined
    : checkedValues.reduce((a, b) => {
        return a + b;
      });
};

const average = (values: FieldValue[]): number | undefined => {
  const checkedValues = checkIsNum(values);
  const numerator = sum(checkedValues);
  const denominator = count(checkedValues);
  if (isDefined(numerator) && denominator !== 0) {
    return numerator / denominator;
  }
  return undefined;
};

const count = (values: FieldValue[]): number => {
  return values.filter(isDefined).length;
};

// helper of max() and min(), e.g.: customSort([1, 2, 3, null]) = [null, 1, 2, 3]
const customSort = (values: FieldValue[]): FieldValue[] => {
  const filteredUndefinedValues = values.filter(isDefined);
  return filteredUndefinedValues.sort((a, b) => {
    if (a === null) {
      return -1;
    }
    if (b === null) {
      return 1;
    }
    return a > b ? 1 : -1;
  });
};

// max([1, 2, 3, null]) = 3; max([null, null]) = null
const max = (values: FieldValue[]): FieldValue => {
  const sortedValues = customSort(values);
  return sortedValues.at(-1);
};

// min([1, 2, 3, null]) = null; min([null, null]) = null
const min = (values: FieldValue[]): FieldValue => {
  const sortedValues = customSort(values);
  return sortedValues[0];
};

const unique = (values: FieldValue[]): FieldValue => {
  const distinctValues = [...new Set(values.filter(isDefined))];
  return distinctValues.length === 1 ? distinctValues[0] : 'NO_UNIQUE_VALUE';
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const exclude = (_values: FieldValue[]): FieldValue => {
  // Do nothing, don't add the field to the existing row
  return undefined;
};

const first = (values: FieldValue[]): FieldValue => {
  return values.find(isDefined);
};

const last = (values: FieldValue[]): FieldValue => {
  return values.slice().reverse().find(isDefined);
};

const single = (values: FieldValue[]): FieldValue => {
  const definedValues = values.filter(isDefined);
  if (definedValues.length === 0) {
    return undefined;
  }

  if (definedValues.length === 1) {
    return definedValues[0];
  }

  throw new Error(
    `'single' merge strategy expects a single value per group, however ${
      definedValues.length
    } were found: ${JSON.stringify(definedValues)}`,
  );
};

export const mergeStrategies = {
  group,
  sum,
  average,
  count,
  max,
  min,
  unique,
  exclude,
  first,
  last,
  single,
  default: single,
};
