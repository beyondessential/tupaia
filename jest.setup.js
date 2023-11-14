/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

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


// Jest custom matcher helper class
/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

/**
 * @typedef {Object} Description
 * @property {string} name
 * @property {string} [receives]
 * @property {string} [expects]
 */

/**
 * @typedef {Object} MatcherConfig
 * @property {Description} description
 * @property {Function} matcher
 * @property {Function} [negationDiff]
 * @property {boolean} [isAsync]
 */

const removeLinesFromTextStart = (text, lineCount) => text.split('\n').slice(lineCount).join('\n');

class JestMatcherFactory {
  constructor(expect, extendApi) {
    this.expect = expect;
    this.extendApi = extendApi;
  }

  /**
   * @param {MatcherConfig} config
   */
  create = config => {
    const { description, matcher, isAsync } = config;

    const onError = error => {
      const diff = this.extractDiffFromMessage(error.message);
      return this.createFailureResponse(description, diff);
    };
    const onSuccess = (received, expected) => {
      const diff = this.createNegationDiff(config, received, expected);
      return this.createSuccessResponse(description, diff);
    };

    const createMatcher = isAsync ? this.createAsync : this.createSync;
    return createMatcher(matcher, onError, onSuccess);
  };

  createAsync = (matcher, onError, onSuccess) => async (received, ...expected) => {
    try {
      await matcher(this.expect, received, expected);
    } catch (error) {
      return onError(error);
    }
    return onSuccess(received, expected);
  };

  createSync = (matcher, onError, onSuccess) => (received, ...expected) => {
    try {
      matcher(this.expect, received, expected);
    } catch (error) {
      return onError(error);
    }
    return onSuccess(received, expected);
  };

  createSuccessResponse = (description, diff) => ({
    message: () => this.createMessage(description, diff),
    pass: true,
  });

  createFailureResponse = (description, diff) => ({
    message: () => this.createMessage(description, diff),
    pass: false,
  });

  createMessage(description, diff) {
    const matcherHint = this.descriptionToMatcherHint(description);
    return `${matcherHint}\n\n${diff}`;
  }

  /**
   * Standard jest error messages include a "matcher hint" in the first line of the error,
   * followed by an empty line and the diff
   */
  extractDiffFromMessage = message => removeLinesFromTextStart(message, 2);

  /**
   * Diff to be shown when a "negated" expectation chain (i.e. one containing a `.not` matcher)
   * is fulfilled, contrary to the expectations.
   *
   * Example:
   * `expect(1 + 1).not.toBe(2)` // Expected: not 2, Received: 2
   */
  createNegationDiff = (config, received, expected) => {
    const { negationDiff } = config;

    return negationDiff
      ? negationDiff(this.extendApi, received, expected)
      : [
        `Expected: not ${this.extendApi.utils.printExpected(expected)}`,
        `Received: ${this.extendApi.utils.printReceived(received)}`,
      ].join('\n');
  };

  descriptionToMatcherHint = description =>
    this.extendApi.utils.matcherHint(description.name, description.receives, description.expects, {
      isNot: this.extendApi.isNot,
    });
}

const addCustomJestMatchers = (_expect, customMatchers) => {
  const expectExtendMap = customMatchers.reduce(
    (map, matcherConfig) => ({
      ...map,
      [matcherConfig.description.name]: function createAndCallMatcher(...args) {
        // `this` will be bound to `expect.extend`
        const matcher = new JestMatcherFactory(_expect, this).create(matcherConfig);
        return matcher(...args);
      },
    }),
    {},
  );

  _expect.extend(expectExtendMap);
};

addCustomJestMatchers(expect, customMatchers);

// Silence winston logs
winston.configure({
  transports: [new winston.transports.Console({ silent: true })],
});

