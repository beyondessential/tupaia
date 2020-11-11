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
export class ExpressionParser {
  constructor() {
    this.math = create(all, {});
    this.parser = this.math.parser();
    this.importFunctions();
  }

  /**
   * Validate an expression and throw an error if it's invalid.
   * @param {*} expression
   */
  validate(expression) {
    const nodeTree = this.math.parse(expression);
    nodeTree.traverse(node => {
      if (node.type === 'OperatorNode' && node.op === '*' && node.implicit) {
        throw new Error('Invalid syntax: Implicit multiplication found');
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
  importFunctions() {}
}
