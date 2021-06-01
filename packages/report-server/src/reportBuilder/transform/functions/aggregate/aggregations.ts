/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { FieldValue } from '../../../types';

const isNotUndefined = <T>(value: T): value is Exclude<T, undefined> => {
  return value !== undefined;
};

const isNotNullOrUndefined = <T>(value: T): value is NonNullable<T> => {
  return value !== undefined && value !== null;
};

// checkIsNum([1, 2, 3, null, undefined]) = 1, 2, 3]
const checkIsNum = (values: FieldValue[]): number[] => {
  const assertIsNumber = (value: FieldValue): value is number => {
    if (typeof value !== 'number') {
      throw new Error(`Expected number, got '${typeof value}'.`);
    }
    return true;
  };
  const filteredUndefinedAndNullValues = values.filter(isNotNullOrUndefined);
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

const avg = (values: FieldValue[]): number | undefined => {
  const checkedValues = checkIsNum(values);
  const numerator = sum(checkedValues);
  const denominator = count(checkedValues);
  if (isNotUndefined(numerator) && denominator !== 0) {
    return numerator / denominator;
  }
  return undefined;
};

const count = (values: FieldValue[]): number => {
  return values.length;
};

// helper of max() and min(), e.g.: customSort([1, 2, 3, null]) = [null, 1, 2, 3]
const customSort = (values: FieldValue[]): FieldValue[] => {
  const filteredUndefinedValues = values.filter(isNotUndefined);
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
  return sortedValues.length !== 0 ? sortedValues.slice().reverse()[0] : undefined;
};

// min([1, 2, 3, null]) = null; min([null, null]) = null
const min = (values: FieldValue[]): FieldValue => {
  const sortedValues = customSort(values);
  return sortedValues.length !== 0 ? sortedValues[0] : undefined;
};

const unique = (values: FieldValue[]): FieldValue => {
  const distinctValues = [...new Set(values.filter(isNotUndefined))];
  return distinctValues.length === 1 ? distinctValues[0] : 'NO_UNIQUE_VALUE';
};

const drop = (values: FieldValue[]): FieldValue => {
  // Do nothing, don't add the field to the existing row
};

const first = (values: FieldValue[]): FieldValue => {
  return values.find(isNotUndefined);
};

const last = (values: FieldValue[]): FieldValue => {
  return values.slice().reverse().find(isNotUndefined);
};

export const aggregations = {
  group,
  sum,
  avg,
  count,
  max,
  min,
  unique,
  drop,
  first,
  last,
  default: last,
};
