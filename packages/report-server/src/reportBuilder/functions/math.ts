/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { sum as mathjsSum, divide as mathjsDivide } from 'mathjs';

const isNumeric = (value: unknown): value is number | undefined =>
  value === undefined || typeof value === 'number';
const isNumericOrArray = (
  value: unknown,
): value is number | undefined | Array<number | undefined> =>
  isNumeric(value) || (Array.isArray(value) && value.every(isNumeric));
const isDefined = <T>(value: T): value is Exclude<T, undefined> => value !== undefined;

export const sum = (
  ...args: (number | undefined | (number | undefined)[])[]
): number | undefined => {
  if (!args.every(isNumericOrArray)) {
    throw new Error('sum received invalid input type');
  }

  const numbers = args.flat();

  const validNumbers = numbers.filter(isDefined);

  if (validNumbers.length === 0) {
    return undefined;
  }

  if (validNumbers.length === 1) {
    return validNumbers[0];
  }

  return mathjsSum(validNumbers);
};

export const divide = (
  ...args: (number | undefined | (number | undefined)[])[]
): number | undefined => {
  if (!args.every(isNumericOrArray)) {
    throw new Error('divide received invalid input type');
  }

  const numbers = args.flat();

  if (numbers.some(number => !isDefined(number))) {
    return undefined;
  }

  const validNumbers = numbers.filter(isDefined);

  if (validNumbers.length === 0) {
    return undefined;
  }

  if (validNumbers.length === 1) {
    return validNumbers[0];
  }

  return validNumbers.reduce((numerator, denominator) => mathjsDivide(numerator, denominator));
};
