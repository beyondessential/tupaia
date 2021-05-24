/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { FieldValue } from '../../../types';

const isUndefined = (value: FieldValue): value is undefined => {
  return value === undefined;
};

const filterUndefinedAndNull = (values: FieldValue[]): NonNullable<FieldValue[]> => {
  const filteredValues: NonNullable<FieldValue[]> = [];
  values.forEach(value => {
    if (value !== undefined && value !== null) {
      filteredValues.push(value);
    }
  });
  return filteredValues;
};

const checkIsNum = (values: FieldValue[]): number[] => {
  const filteredUndefinedAndNullValues = filterUndefinedAndNull(values);
  const checkedValues: number[] = [];
  filteredUndefinedAndNullValues.forEach(value => {
    if (typeof value !== 'number') {
      throw new Error(`Expected number, got '${typeof value}'.`);
    }
    checkedValues.push(value);
  });
  return checkedValues;
};

const group = (values: FieldValue[]): FieldValue => {
  if (values.length !== 0) {
    return values[0];
  }
  return undefined;
};

const sum = (values: FieldValue[]): number | undefined => {
  if (values.length !== 0) {
    const checkedValues: number[] = checkIsNum(values);
    return checkedValues.reduce((a, b) => {
      return a + b;
    });
  }
  return undefined;
};

const avg = (values: FieldValue[]): number | undefined => {
  const numerator: number | undefined = sum(values);
  const denominator: number = count(values);
  if (!isUndefined(numerator) && !isUndefined(denominator) && denominator !== 0) {
    return numerator / denominator;
  }
  return undefined;
};

const count = (values: FieldValue[]): number => {
  return values.length;
};

const max = (values: FieldValue[]): FieldValue => {
  if (values.length !== 0) {
    let maxValue: FieldValue = values[0];
    values.forEach(value => {
      if (!isUndefined(value) && !isUndefined(maxValue) && value > maxValue) maxValue = value;
    });
    return maxValue;
  }
  return undefined;
};

const min = (values: FieldValue[]): FieldValue => {
  if (values.length !== 0) {
    let minValue: FieldValue = values[0];
    values.forEach(value => {
      if (!isUndefined(value) && !isUndefined(minValue) && value < minValue) minValue = value;
    });
    return minValue;
  }
  return undefined;
};

const unique = (values: FieldValue[]): FieldValue => {
  if (values.length !== 0) {
    for (let i = 0; i < values.length - 1; i++) {
      if (values[i] !== values[i + 1]) {
        return 'NO_UNIQUE_VALUE';
      }
    }
    return values[0];
  }
  return undefined;
};

const drop = (values: FieldValue[]): FieldValue => {
  // Do nothing, don't add the field to the existing row
};

const first = (values: FieldValue[]): FieldValue => {
  for (let i = 0; i < values.length; i++) {
    if (!isUndefined(values[i])) {
      return values[i];
    }
  }
  return undefined;
};

const last = (values: FieldValue[]): FieldValue => {
  for (let i = values.length; i > 0; i--) {
    if (!isUndefined(values[i])) {
      return values[i];
    }
  }
  return undefined;
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
