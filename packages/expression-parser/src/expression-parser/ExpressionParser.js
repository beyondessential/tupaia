/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import math from 'mathjs';

export class ExpressionParser {
  constructor() {
    this.parser = math.parser();
  }

  evaluateExpression(expression) {
    return this.parser.evaluate(expression);
  }

  getVariables() {
    return this.parser.getAll();
  }

  setScopeVariable(name, value) {
    this.parser.set(name, value);
  }
}
