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

export const eq = (valuesToCompare: FieldValue[]): boolean => {
  return valuesToCompare[0] === valuesToCompare[1];
};

export const neq = (valuesToCompare: FieldValue[]): boolean => {
  return valuesToCompare[0] !== valuesToCompare[1];
};

export const exists = (value: FieldValue): boolean => {
  return value !== undefined;
};
