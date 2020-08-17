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

const replaceLinesFromTextStart = (text, lineCount) =>
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
   * @param {{ description: Description, matcher: Function }} config
   */
  create = config => (received, ...expected) => {
    const { description, matcher } = config;

    try {
      const expectChain = this.isNot ? this.expect(received).not : this.expect(received);
      matcher(expectChain, ...expected);
    } catch (error) {
      const diff = this.extractDiffFromMessage(error.message);
      return this.createFailureResponse(description, diff);
    }
    const diff = this.createNegationDiff(received, ...expected);
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
  extractDiffFromMessage = message => replaceLinesFromTextStart(message, 2);

  createNegationDiff = (received, ...expected) =>
    [
      `Expected: not ${this.utils.printExpected(...expected)}`,
      `Received: ${this.utils.printReceived(received)}`,
    ].join('\n');

  descriptionToMatcherHint = description =>
    this.extendApi.utils.matcherHint(description.name, description.receives, description.expects);
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
