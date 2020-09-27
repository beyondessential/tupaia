/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

/* eslint-disable import/no-extraneous-dependencies */
/* eslint-env jest */

require('jest-extended');

const winston = require('winston');

const { addCustomJestMatchers } = require('@tupaia/utils');

const customMatchers = [
  {
    description: {
      name: 'toHaveBeenCalledOnceWith',
      receives: 'jest.fn()',
    },
    matcher: (expectChain, expected) => {
      expectChain.toHaveBeenCalledTimes(1);
      expectChain.toHaveBeenCalledWith(...expected);
    },
    negationDiff: (extendApi, _, expected) =>
      `Expected spy not to have been called ${extendApi.utils.RECEIVED_COLOR(
        'once',
      )} with ${extendApi.utils.printReceived(expected)}`,
  },
  {
    description: {
      name: 'toBeRejectedWith',
    },
    matcher: async (expectChain, [expected]) => {
      expect.hasAssertions();
      await expectChain.rejects.toThrow(expected);
    },
    negationDiff: (extendApi, _, expected) =>
      `Expected promise not to have been rejected with ${extendApi.utils.RECEIVED_COLOR(
        expected,
      )} `,
  },
];

addCustomJestMatchers(expect, customMatchers);

// Silence winston logs
winston.configure({
  transports: [new winston.transports.Console({ silent: true })],
});
