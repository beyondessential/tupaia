/* eslint-env jest */

require('jest-extended');
const dotenv = require('dotenv');

dotenv.config();

/**
 * Note: Due to incompatibility with jest-expected-message and jest 27+ we are disabling
 * the custom error messages for these tests. Will re-instate once the fix gets merged:
 *  https://github.com/mattphillips/jest-expect-message/pull/40
 */
// require('jest-expect-message');

const winston = require('winston');

const { addCustomJestMatchers } = require('@tupaia/utils');

const customMatchers = [
  {
    description: {
      name: 'toHaveBeenCalledOnceWith',
      receives: 'jest.fn()',
    },
    matcher: (expectChain, received, expected) => {
      expectChain(received).toHaveBeenCalledTimes(1);
      expectChain(received).toHaveBeenCalledWith(...expected);
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
    matcher: async (expectChain, received, [expected]) => {
      expectChain.hasAssertions();

      let isErrorThrown = false;
      return received
        .catch(error => {
          isErrorThrown = true;
          // Throw the error again in a sync function so that
          // the standard `toThrow` matcher  from `jest` can be used
          expect(() => {
            throw error;
          }).toThrow(expected);
        })
        .then(() => {
          if (!isErrorThrown) {
            // Force an error matching failure using the standard `jest` error matchers
            expect(() => {}).toThrow(expected);
          }
        });
    },

    negationDiff: (extendApi, _, expected) =>
      `Expected promise not to have been rejected with ${extendApi.utils.RECEIVED_COLOR(
        expected,
      )} `,
    isAsync: true,
  },
];

addCustomJestMatchers(expect, customMatchers);

// Silence winston logs
winston.configure({
  transports: [new winston.transports.Console({ silent: true })],
});
