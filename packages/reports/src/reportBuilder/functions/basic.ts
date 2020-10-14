import { FieldValue } from '../reportBuilder';

export const value = (valueGiven: FieldValue): FieldValue => {
  return valueGiven;
};

export const last = (values: FieldValue[]): FieldValue => {
  return values.reverse()[0];
};

export const eq = (value1, value2): boolean => {
  return value1 === value2;
};

export const neq = (value1, value2): boolean => {
  return value1 !== value2;
};

export const gt = (value1, value2): boolean => {
  return value1 > value2;
};

export const exists = (value: FieldValue): boolean => {
  return value !== undefined;
};
