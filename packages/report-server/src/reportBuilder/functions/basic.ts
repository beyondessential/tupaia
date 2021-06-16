/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { FieldValue } from '../types';

export const value = (valueGiven: FieldValue): FieldValue => {
  return valueGiven;
};

export const last = (values: FieldValue[]): FieldValue => {
  if (!Array.isArray(values)) {
    throw new Error(`Function 'last' expected an array, but got: ${values}`);
  }

  if (values.length < 1) {
    return undefined;
  }

  return values[values.length - 1];
};

export const eq = (value1, value2): boolean => {
  return value1 === value2;
};

export const notEq = (value1, value2): boolean => {
  return value1 !== value2;
};

export const gt = (value1, value2): boolean => {
  return value1 > value2;
};

export const exists = (value: FieldValue): boolean => {
  return value !== undefined;
};

export const notExists = (value: FieldValue): boolean => {
  return value === undefined;
};
