/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { create, all } from 'mathjs';

export class ExpressionParser {
  constructor() {
    this.math = create(all, {});
    this.parser = this.math.parser();
  }

  /**
   * Evaluate an expression.
   * Before evaluating an expression, the scope will be sanitized to fix up any invalid variables that we want to support
   * @param {*} expression
   */
  evaluate(expression) {
    const originalScope = this.parser.getAll();

    // Sanitize scope and expression to fix any invalid variables before evaluating the expression
    const sanitizedExpression = this.sanitizeExpression(expression, originalScope);

    // Evaluate the sanitized expression
    const result = this.parser.evaluate(sanitizedExpression);

    // Reset the scope variables to original;
    this.clearScope();
    this.setScope(originalScope);

    return result;
  }

  /**
   * Set the parser's scope.
   * @param {*} scope
   * @param {*} defaultScope
   */
  setScope(scope = {}, defaultScope = {}) {
    Object.entries(scope).forEach(([name, value]) => {
      const expressionValue = value || defaultScope[name] || 0;
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
   * Sanitize any invalid variables in the scope and expression.
   * Eg: variables that start with numbers
   * @param {*} expression
   * @param {*} originalScope
   */
  sanitizeExpression(expression, originalScope) {
    let sanitizedExpression = expression;

    // Clear the scope and set new sanitized variables (if there's any)
    this.clearScope();

    // Sanitize the scope variables and replace variable names in expression
    Object.entries(originalScope).forEach(([name, value]) => {
      const sanitizedName = this.sanitizeVariableName(name);
      this.parser.set(sanitizedName, value);

      if (name !== sanitizedName) {
        sanitizedExpression = sanitizedExpression.replace(name, sanitizedName);
      }
    });

    return sanitizedExpression;
  }

  /**
   * Sanitize a variable name.
   * Eg: variables that start with numbers
   * @param {*} name
   */
  sanitizeVariableName(name) {
    let sanitizedName = name;

    // mathjs does not allow variable names that begin with numbers (eg: 55aa) because they will be parsed as implicit multiplication (55aa -> 55 * aa).
    // In Tupaia, we sometimes want to support variables starting with numbers like data code or question id.
    // So to support it all the time, add a prefix $ to prevent implicit multiplication parsing
    if (this.startsWithNumber(name)) {
      sanitizedName = `$${sanitizedName}`;
    }

    return sanitizedName;
  }

  startsWithNumber(s) {
    return s.match(/^\d/);
  }

  /**
   * Clear the scope of the parser.
   * This will not remove any imported functions.
   */
  clearScope() {
    this.parser.clear();
  }
}
