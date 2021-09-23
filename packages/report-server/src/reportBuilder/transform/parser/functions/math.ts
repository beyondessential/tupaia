/* eslint-disable @typescript-eslint/no-unused-vars */

/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { typed } from 'mathjs';

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

const enforceIsNumber = (value: unknown) => {
  if (typeof value !== 'number') {
    throw new Error(`Expected number, got: ${value}`);
  }
  return value;
};

export const sum = typed('sum', {
  '...': function (args: unknown[]) {
    return this(args); // 'this' is bound by mathjs to allow recursive function calls to other typed function implementations
  },
  number: (num: number) => num,
  undefined: (undef: undefined) => undefined,
  Array: (arr: unknown[]) =>
    arr.every(item => item === undefined)
      ? undefined
      : arr
          .filter(item => item !== undefined)
          .map(enforceIsNumber)
          .reduce((total, item) => total + item, 0),
});
