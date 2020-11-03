/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { ExpressionParser } from './ExpressionParser';

export class BooleanExpressionParser extends ExpressionParser {
  evaluate(expression, values = {}, defaultValues = {}) {
    this.setScopeVariables(values, defaultValues);

    return this.evaluateExpression(expression);
  }
}
