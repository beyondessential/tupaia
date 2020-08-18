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

const removeLinesFromTextStart = (text, lineCount) =>
  text
    .split('\n')
    .slice(lineCount)
    .join('\n');

class JestMatcherFactory {
  constructor(expect, extendApi) {
    this.expect = expect;
    this.extendApi = extendApi;
  }

  /**
   * Joins all matchers in the config with AND logic
   * @param {{ description: Description, matcher: Function, negationDiff: Function }} config
   */
  create = config => (received, ...expected) => {
    const { description, matcher } = config;

    try {
      matcher(this.expect(received), expected);
    } catch (error) {
      const diff = this.extractDiffFromMessage(error.message);
      return this.createFailureResponse(description, diff);
    }

    const diff = this.createNegationDiff(config, received, expected);
    return this.createSuccessResponse(description, diff);
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

export const addCustomJestMatchers = (expect, customMatchers) => {
  const expectExtendMap = customMatchers.reduce(
    (map, matcherConfig) => ({
      ...map,
      [matcherConfig.description.name]: function createAndCallMatcher(...args) {
        // `this` will be bound to `expect.extend`
        const matcher = new JestMatcherFactory(expect, this).create(matcherConfig);
        return matcher(...args);
      },
    }),
    {},
  );

  expect.extend(expectExtendMap);
};
