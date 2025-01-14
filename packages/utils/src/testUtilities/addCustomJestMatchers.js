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
