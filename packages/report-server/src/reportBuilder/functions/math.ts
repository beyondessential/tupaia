/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { sum as mathjsSum, divide as mathjsDivide, Matrix, filter } from 'mathjs';

const isDefined = <T>(value: T): value is Exclude<T, undefined> => value !== undefined;

export const sum = (numbers?: Matrix): number | undefined => {
  if (numbers === undefined) {
    return undefined;
  }

  return mathjsSum(filter(numbers, number => number !== undefined));
};

export const divide = (
  ...args: (number | undefined | (number | undefined)[])[]
): number | undefined => {
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
