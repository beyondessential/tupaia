/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { FieldValue } from '../../../types';

export const value = (valueGiven: FieldValue): FieldValue => {
  return valueGiven;
};

export const first = (values: FieldValue[]): FieldValue => {
  if (!Array.isArray(values)) {
    throw new Error(`Function 'first' expected an array, but got: ${values}`);
  }

  if (values.length < 1) {
    return undefined;
  }

  return values[0];
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

export const eq = (val1: any, val2: any): boolean => {
  return val1 === val2;
};

export const notEq = (val1: any, val2: any): boolean => {
  return val1 !== val2;
};

export const gt = (val1: any, val2: any): boolean => {
  return val1 > val2;
};

export const exists = (val: any): boolean => {
  return val !== undefined;
};

export const notExists = (val: FieldValue): boolean => {
  return val === undefined;
};

export const length = (val: any[]): number => {
  return val.length;
};

export const any = (...args: boolean[]): boolean => {
  return args.some(x => x === true);
};

export const all = (...args: boolean[]): boolean => {
  return args.every(x => x === true);
};
