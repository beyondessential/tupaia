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

export class ExpressionParser {
  constructor() {
    this.math = create(all, {});
    this.parser = this.math.parser();
    this.customFunctions = this.getCustomFunctions();
    this.math.import(this.customFunctions);
  }

  /**
   * Return the variable names from an expression.
   * @param {*} expression
   */
  getVariables(expression) {
    this.validate(expression);
    const nodeTree = this.math.parse(expression);
    const result = nodeTree
      .filter(node => node.isSymbolNode && !Object.keys(this.customFunctions).includes(node.name))
      .map(({ name }) => name);
    return result;
  }

  /**
   * Validate an expression and throw an error if it's invalid.
   * @param {*} expression
   */
  validate(expression) {
    const nodeTree = this.math.parse(expression);
    nodeTree.traverse(node => {
      if (node.isOperatorNode && node.op === '*' && node.implicit) {
        throw new Error(
          'Invalid syntax: Implicit multiplication found. Perhaps you used a variable starting with a number?',
        );
      }
    });
  }

  /**
   * Evaluate an expression. Also validate the expression beforehand
   * @param {*} expression
   */
  evaluate(expression) {
    this.validate(expression);
    return this.parser.evaluate(expression);
  }

  evaluateToNumber(expression) {
    const result = this.evaluate(expression);
    if (typeof result === 'boolean') {
      return result ? 1 : 0;
    }
    return result;
  }

  /**
   * Set the parser's scope.
   * @param {*} scope
   */
  setScope(scope = {}) {
    Object.entries(scope).forEach(([name, value]) => {
      const expressionValue = value || 0;
      this.set(name, expressionValue);
    });
  }

  /**
   * Add a value to the parser's scope.
   * @param {*} name
   * @param {*} value
   */
  set(name, value) {
    this.parser.set(name, value);
  }

  /**
   * Clear the scope of the parser.
   * This will not remove any imported functions.
   */
  clearScope() {
    this.parser.clear();
  }

  /**
   * This can be overridden in child classes to import new functions.
   */
  getCustomFunctions() {
    return {
      avg: average,
    };
  }
}
