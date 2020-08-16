/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

/* eslint-env jest */

const { addCustomJestMatchers } = require('@tupaia/utils');

const customMatchers = [
  {
    type: 'and',
    description: {
      name: 'toHaveBeenCalledOnceWith',
      receives: 'jest.fn()',
    },
    matchers: [
      expectChain => expectChain.toHaveBeenCalledTimes(1),
      (expectChain, ...expected) => expectChain.toHaveBeenCalledWith(...expected),
    ],
  },
];

addCustomJestMatchers(expect, customMatchers);
