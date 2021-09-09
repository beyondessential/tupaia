/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { create, all } from 'mathjs';

/**
 * Usage:
 * const expressionParser = new ExpressionParser();
 *
 * //Set the scope variable a
 * expressionParser.set('a', 1);
 *
 * //Evaluate an expression that has a as a variable
 * expressionParser.evaluate('a + 2'); //returns 3
 */

const average = (...argumentList) => {
  const existingValues = argumentList.filter(a => a !== 'undefined');
  const sum = existingValues.reduce((a, b) => a + b, 0);
  return sum / existingValues.length;
};

const firstExistingValue = (...argumentList) => {
  for (const value of argumentList) {
    if (value !== 'undefined') {
      return value;
    }
  }

  return undefined; // Should make sure that at least 1 value exists
};

const translate = (value, translations) => {
  return translations[value];
};

/**
 * List of built in functions in math.js
 * This list is here because when extracting variables for an expression by traversing the node tree,
 * the built in functions are also considered as Symbol Node (which is similar to variables).
 * So we want to exclude them when getting the variables.
 */
const BUILT_IN_FUNCTIONS = ['equalText', 'round'];

const ADDITIONAL_ALPHA_CHARS = ['@'];

export class ExpressionParser {
  /**
   * @typedef { { get: (s: string) => unknown, set: (s: string, v: unknown) => void, has: (s: string) => boolean, keys: () => string[], delete: (s: string) => void, clear: () => void } } Scope
   *
   * Can pass in a custom scope
   * @param {Scope} customScope
   */
  constructor(customScope = new Map()) {
    this.math = create(all);

    // Add additional alpha chars, to allow for usage in variable names
    const isAlphaOriginal = this.math.parse.isAlpha;
    this.math.parse.isAlpha = (c, cPrev, cNext) => {
      return ADDITIONAL_ALPHA_CHARS.includes(c) || isAlphaOriginal(c, cPrev, cNext);
    };

    this.customScope = customScope;
    this.customFunctions = this.getCustomFunctions();
    this.math.import(this.customFunctions);
    this.validExpressionCache = new Set();
  }

  /**
   * Return the variable names from an expression.
   * @param {*} expression
   */
  getVariables(expression) {
    this.validate(expression);
    const nodeTree = this.math.parse(expression);
    const variables = nodeTree
      .filter(
        node =>
          node.isSymbolNode &&
          !Object.keys(this.customFunctions).includes(node.name) &&
          !BUILT_IN_FUNCTIONS.includes(node.name),
      )
      .map(({ name }) => name);
    return [...new Set(variables)];
  }

  /**
   * Validate an expression and throw an error if it's invalid.
   * @param {*} expression
   */
  validate(expression) {
    if (this.validExpressionCache.has(expression)) {
      return;
    }

    const nodeTree = this.math.parse(expression);
    nodeTree.traverse(node => {
      if (node.isOperatorNode && node.op === '*' && node.implicit) {
        throw new Error(
          'Invalid syntax: Implicit multiplication found. Perhaps you used a variable starting with a number?',
        );
      }
    });
    this.validExpressionCache.add(expression);
  }

  /**
   * Evaluate an expression. Also validate the expression beforehand
   * @param {*} expression
   */
  evaluate(expression) {
    this.validate(expression);
    return this.math.evaluate(expression, this.customScope);
  }

  /**
   * Evaluate an expression and cast boolean results to 1 or 0. Also validate the expression beforehand.
   *
   * Note this could also return a string, array, or object (potentially others too)
   * @param {*} expression
   */
  evaluateToNumber(expression) {
    const result = this.evaluate(expression);
    if (typeof result === 'boolean') {
      return result ? 1 : 0;
    }
    return result;
  }

  /**
   * Set all variables to the parser's scope.
   * @param {*} variables
   */
  setAll(variables = {}) {
    Object.entries(variables).forEach(([name, value]) => {
      const expressionValue = value || 0;
      this.set(name, expressionValue);
    });
  }

  /**
   * Add a variable to the parser's scope.
   * @param {*} name
   * @param {*} value
   */
  set(name, value) {
    this.customScope.set(name, value);
  }

  /**
   * Delete a variable from the parser's scope.
   * @param {*} name
   */
  delete(name) {
    this.customScope.delete(name);
  }

  /**
   * Clear the scope of the parser.
   * This will not remove any imported functions.
   */
  clearScope() {
    this.customScope.clear();
  }

  /**
   * @protected
   * This can be overridden in child classes to import new functions.
   * @returns {Record<string, (...args: any[]) => any>} functions
   */
  getCustomFunctions() {
    return {
      avg: average,
      firstExistingValue,
      translate,
    };
  }
}
