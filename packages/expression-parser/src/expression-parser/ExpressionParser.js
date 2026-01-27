import { all, create } from 'mathjs';

import { customFunctions } from './customFunctions';
import { customNamespaces } from './customNamespaces';

/**
 * @typedef {Object} Scope
 * @property {(s: string) => unknown} get
 * @property {(s: string, v: unknown) => void} set
 * @property {(s: string) => boolean} has
 * @property {(s: string) => void} delete
 * @property {() => void} delete
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

const ADDITIONAL_ALPHA_CHARS = ['@'];
const CUSTOM_CONFIG = {
  matrix: 'Array', // Have mathjs treat array-like objects as plain arrays rather than mathjs Matrix
};

export class ExpressionParser {
  /**
   * Can pass in a custom scope
   * @param {Scope} customScope
   */
  constructor(customScope = new Map()) {
    this.math = create(all, CUSTOM_CONFIG);

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
    this.setAll(customNamespaces);
  }

  /**
   * Can override in child classes to allow custom expression formats
   * @protected
   */
  readExpression(input) {
    return input;
  }

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

  isFunctionName(name) {
    return this.customFunctionNames.includes(name) || this.isBuiltInFunction(name);
  }

  /**
   * Return the variable names in an expression.
   * @param {*} expression
   */
  getVariables(expression) {
    return this.extractSymbols(expression, node => !this.isFunctionName(node.name));
  }

  /**
   * Return the function names in an expression.
   * @param {*} expression
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
   * @param {*} expression
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
   * @param {*} expression
   */
  evaluate(expression) {
    const expr = this.readExpression(expression);
    this.validate(expr);
    return this.math.evaluate(expr, this.customScope);
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
    return customFunctions;
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
    return this.math.factory(...args);
  }
}
