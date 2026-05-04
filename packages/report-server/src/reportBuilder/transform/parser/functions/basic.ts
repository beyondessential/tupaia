import { uniq } from 'es-toolkit';
import { FieldValue } from '../../../types';

export const value = <T extends FieldValue>(valueGiven: T): T => {
  return valueGiven;
};

export const first = <T extends readonly FieldValue[]>(values: T): T[0] => {
  if (!Array.isArray(values)) {
    throw new Error(`Function 'first' expected an array, but got: ${values}`);
  }

  return values[0];
};

export const last = (values: readonly FieldValue[]): FieldValue => {
  if (!Array.isArray(values)) {
    throw new Error(`Function 'last' expected an array, but got: ${values}`);
  }

  return values.at(-1);
};

export const unique = (values: readonly FieldValue[]): FieldValue[] => {
  if (!Array.isArray(values)) {
    throw new Error(`Function 'unique' expected an array, but got: ${values}`);
  }

  return uniq(values);
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
