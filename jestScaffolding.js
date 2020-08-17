/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

/* eslint-disable import/no-extraneous-dependencies */
/* eslint-env jest */

require('jest-chain');
require('jest-extended');

const { addCustomJestMatchers } = require('@tupaia/utils');

const customMatchers = [
  {
    description: {
      name: 'toHaveBeenCalledOnceWith',
      receives: 'jest.fn()',
    },
    matcher: (expectChain, ...expected) =>
      expectChain.toHaveBeenCalledTimes(1).toHaveBeenCalledWith(...expected),
  },
];

addCustomJestMatchers(expect, customMatchers);
