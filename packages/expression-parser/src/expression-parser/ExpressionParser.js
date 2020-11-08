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

  evaluate(expression) {
    const originalVariables = this.parser.getAll();

    // Sanitize scope and expression to fix any invalid variables before evaluating the expression
    const sanitizedExpression = this.sanitizeExpression(expression, originalVariables);

    // Evaluate the sanitized expression
    const result = this.parser.evaluate(sanitizedExpression);

    // Reset the scope variables to original;
    this.clear();
    this.setScopeVariables(originalVariables);

    return result;
  }

  setScopeVariables(values = {}, defaultValues = {}) {
    Object.entries(values).forEach(([name, value]) => {
      const expressionValue = value || defaultValues[name] || 0;
      this.setScopeVariable(name, expressionValue);
    });
  }

  setScopeVariable(name, value) {
    this.parser.set(name, value);
  }

  sanitizeExpression(expression, originalVariables) {
    let sanitizedExpression = expression;

    // Clear the scope and set new sanitized variables (if there's any)
    this.clear();

    // Sanitize the scope variables and replace variable names in expression
    Object.entries(originalVariables).forEach(([name, value]) => {
      const sanitizedName = this.sanitizeVariableName(name);
      this.parser.set(sanitizedName, value);

      if (name !== sanitizedName) {
        sanitizedExpression = sanitizedExpression.replace(name, sanitizedName);
      }
    });

    return sanitizedExpression;
  }

  sanitizeVariableName(name) {
    let sanitizedName = name;

    // mathjs does not allow variable name that begins with numbers (eg: 55aa) because it will be parsed as implicit multiplication (55aa -> 55 * aa).
    // In Tupaia, we sometimes want to support variables starting with number like data code or question id.
    // So to support it all the time, we add a prefix $ to prevent implicit multiplication parsing
    if (this.startsWithNumber(name)) {
      sanitizedName = `$${sanitizedName}`;
    }

    return sanitizedName;
  }

  startsWithNumber(s) {
    return s.match(/^\d/);
  }

  clear() {
    this.parser.clear();
  }
}
