/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { FieldValue } from '../../../types';

const isUndefined = (value: FieldValue): value is undefined => {
  return value === undefined;
};

const isNum = (value: FieldValue): value is number => {
  return typeof value === 'number';
};

const group = (values: FieldValue[]): FieldValue => {
  return values[0];
};

const sum = (values: FieldValue[]): FieldValue => {
  if (values.length !== 0) {
    return values.reduce((a, b) => {
      if (isNum(a) && isNum(b)) {
        return a + b;
      }
      throw new Error(`Expected number, got '${typeof a}' and '${typeof b}'.`);
    });
  }
  return undefined;
};

const avg = (values: FieldValue[]): FieldValue => {
  const numerator = sum(values);
  const denominator = count(values);
  if (isNum(numerator) && isNum(denominator)) {
    return numerator / denominator;
  }
  return undefined;
};

const count = (values: FieldValue[]): FieldValue => {
  return values.length;
};

const max = (values: FieldValue[]): FieldValue => {
  const existingValue: FieldValue = existingRow[field];
  if (!isUndefined(value)) {
    if (isUndefined(existingValue)) {
      existingRow[field] = value;
    } else if (value > existingValue) {
      existingRow[field] = value;
    }
  }
};

const min = (values: FieldValue[]): FieldValue => {
  const existingValue: FieldValue = existingRow[field];
  if (!isUndefined(value)) {
    if (isUndefined(existingValue)) {
      existingRow[field] = value;
    } else if (value < existingValue) {
      existingRow[field] = value;
    }
  }
};

const unique = (values: FieldValue[]): FieldValue => {
  if (!isUndefined(existingRow[field]) && existingRow[field] !== value) {
    existingRow[field] = 'NO_UNIQUE_VALUE';
  } else {
    existingRow[field] = value;
  }
};

const drop = (values: FieldValue[]): FieldValue => {
  // Do nothing, don't add the field to the existing row
};

const first = (values: FieldValue[]): FieldValue => {
  if (isUndefined(existingRow[field])) {
    existingRow[field] = value;
  }
};

const last = (values: FieldValue[]): FieldValue => {
  existingRow[field] = value;
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
