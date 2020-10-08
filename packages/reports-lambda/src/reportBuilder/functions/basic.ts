import { FieldValue } from '../reportBuilder';

export const value = (valueGiven: FieldValue): FieldValue => {
  return valueGiven;
};

export const add = (valuesToAdd: number[]): number => {
  let total = 0;
  valuesToAdd.forEach((valueToAdd: number) => {
    if (valueToAdd) total += valueToAdd;
  });
  return total;
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
