/* eslint-disable @typescript-eslint/no-unused-vars */

/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { typed, mean as mathjsMean } from 'mathjs';

export const divide = typed('divide', {
  'number, undefined': (num: number, undef: undefined) => undefined,
  'undefined, number': (undef: undefined, num: number) => undefined,
  'undefined, undefined': (undef: undefined, undef2: undefined) => undefined,
});

export const add = typed('add', {
  'number, undefined': (num: number, undef: undefined) => num,
  'undefined, number': (undef: undefined, num: number) => num,
  'undefined, undefined': (undef: undefined, undef2: undefined) => undefined,
  'string, string': (string1: string, string2: string) => string1 + string2,
  'string, number': (string: string, num: number) => string + num,
  'number, string': (num: number, string: string) => num.toString() + string,
});

const enforceIsNumber = (value: unknown) => {
  if (typeof value !== 'number') {
    throw new Error(`Expected number, got: ${value}`);
  }
  return value;
};

const sumArray = (arr: unknown[]) =>
  arr.every(item => item === undefined)
    ? undefined
    : arr
        .filter(item => item !== undefined)
        .map(enforceIsNumber)
        .reduce((total, item) => total + item, 0);

export const sum = typed('sum', {
  '...': function (args: unknown[]) {
    return sumArray(args);
  },
  number: (num: number) => num,
  undefined: (undef: undefined) => undefined,
  Array: sumArray,
});

const calculateMean = (arr: unknown[]) => {
  const numbersArray = arr.every(item => item === undefined)
    ? undefined
    : arr.filter(item => item !== undefined).map(enforceIsNumber);
  if (numbersArray === undefined) {
    return undefined;
  }
  return mathjsMean(numbersArray);
};

export const mean = typed('mean', {
  '...': (args: unknown[]) => {
    return calculateMean(args);
  },
  Array: calculateMean,
});

const minArrayValue = (arr: any[]) =>
  arr.reduce((smallest, current) => (current < smallest ? current : smallest));

export const min = typed('min', {
  Array: minArrayValue,
  '...any': (values: unknown[]) => minArrayValue(values),
});

const maxArrayValue = (arr: any[]) =>
  arr.reduce((largest, current) => (current > largest ? current : largest));

export const max = typed('max', {
  Array: maxArrayValue,
  '...any': (values: unknown[]) => maxArrayValue(values),
});
