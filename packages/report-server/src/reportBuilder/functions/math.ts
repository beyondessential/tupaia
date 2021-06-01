/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { sum as mathjsSum, divide as mathjsDivide } from 'mathjs';

const isDefined = <T>(value: T): value is Exclude<T, undefined> => value !== undefined;

export const sum = (...numbers: (number | undefined)[]): number | undefined => {
  const validNumbers = numbers.filter(isDefined);

  if (validNumbers.length === 0) {
    return undefined;
  }

  return mathjsSum(validNumbers);
};

export const divide = (...numbers: (number | undefined)[]): number | undefined => {
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
