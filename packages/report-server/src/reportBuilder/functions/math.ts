/* eslint-disable @typescript-eslint/no-unused-vars */

/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { typed, sum as mathjsSum } from 'mathjs';

export const divide = typed('divide', {
  'number, undefined': (num: number, undef: undefined) => undefined,
  'undefined, number': (undef: undefined, num: number) => undefined,
  'undefined, undefined': (undef: undefined, undef2: undefined) => undefined,
});

export const add = typed('add', {
  'number, undefined': (num: number, undef: undefined) => num,
  'undefined, number': (undef: undefined, num: number) => num,
  'undefined, undefined': (undef: undefined, undef2: undefined) => undefined,
});

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
