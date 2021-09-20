/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { create, all, factory } from 'mathjs';

/**
 * @typedef {Object} Scope
 * @property {(s: string) => unknown} get
 * @property {(s: string, v: unknown) => void} set
 * @property {(s: string) => boolean} has
 * @property {(s: string) => void} delete
 * @property {() => void} delete
 */

/**
 * @typedef {Object} FactoryParams
 * @property {string[]} dependencies
 * @property {(dependencies: Record<string, Function>) => Function} create
 *
 * @see https://mathjs.org/docs/core/extension.html#factory-functions
 */

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

const ADDITIONAL_ALPHA_CHARS = ['@'];

export class ExpressionParser {
  /**
   * Override in child classes to use a custom prefix
   * @protected
   */
  CALCULATION_PREFIX = '';

  /**
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
    this.customFunctionNames = Object.keys(this.getCustomFunctions());
    this.math.import(this.getCustomFunctions(), { wrap: true });
    this.math.import(this.getFunctionExtensions());
    this.math.import(this.getFunctionOverrides(), { wrap: true, override: true });
    this.validExpressionCache = new Set();
  }

  isCalculation = expression =>
    expression.length > 0 && expression.startsWith(this.CALCULATION_PREFIX);

  readExpression = expression =>
    this.CALCULATION_PREFIX
      ? expression.replace(new RegExp(`^${this.CALCULATION_PREFIX}`), '')
      : expression;

  /**
   * @param {string} name
   * @return bool
   */
  isBuiltInFunction(name) {
    try {
      // see https://mathjs.org/docs/reference/functions/help.html
      this.math.help(name);
      return true;
    } catch (e) {
      return false;
    }
  }

  isFunctionName = name => this.customFunctionNames.includes(name) || this.isBuiltInFunction(name);

  /**
   * Return the variable names in an expression.
   * @param {string} expression
   */
  getVariables(expression) {
    return this.extractSymbols(expression, node => !this.isFunctionName(node.name));
  }

  /**
   * Return the function names in an expression.
   * @param {string} expression
   */
  getFunctions(expression) {
    return this.extractSymbols(expression, node => this.isFunctionName(node.name));
  }

  extractSymbols(expression, extractor) {
    const expr = this.readExpression(expression);
    this.validate(expr);
    const nodeTree = this.math.parse(expr);
    const items = nodeTree
      .filter(node => node.isSymbolNode && extractor(node))
      .map(({ name }) => name);

    return [...new Set(items)];
  }

  /**
   * Validate an expression and throw an error if it's invalid.
   * @param {string} expression
   */
  validate(expression) {
    const expr = this.readExpression(expression);
    if (this.validExpressionCache.has(expr)) {
      return;
    }

    const nodeTree = this.math.parse(expr);
    nodeTree.traverse(node => {
      if (node.isOperatorNode && node.op === '*' && node.implicit) {
        throw new Error(
          'Invalid syntax: Implicit multiplication found. Perhaps you used a variable starting with a number?',
        );
      }
    });
    this.validExpressionCache.add(expr);
  }

  /**
   * Evaluate an expression. Also validate the expression beforehand
   * @param {string} expression
   */
  evaluate(expression) {
    const expr = this.readExpression(expression);
    this.validate(expr);
    return this.math.evaluate(expr, this.customScope);
  }

  /**
   * Evaluate an expression and cast boolean results to 1 or 0. Also validate the expression beforehand.
   *
   * Note this could also return a string, array, or object (potentially others too)
   * @param {string} expression
   */
  evaluateToNumber(expression) {
    const expr = this.readExpression(expression);
    const result = this.evaluate(expr);
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
      this.set(name, value);
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
   * Custom functions to be imported
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

  /**
   * Functions to merge with existing mathjs functions
   * @protected
   * This can be overridden in child classes to import new functions.
   * @returns {Record<string, (...args: any[]) => any>} functions
   */
  getFunctionExtensions() {
    return {};
  }

  /**
   * Functions to override existing mathjs functions
   * @protected
   * This can be overridden in child classes to import new functions.
   * @returns {Record<string, (...args: any[]) => any>} functions
   */
  getFunctionOverrides() {
    return {};
  }

  factory(...args) {
    return factory(...args);
  }
}
