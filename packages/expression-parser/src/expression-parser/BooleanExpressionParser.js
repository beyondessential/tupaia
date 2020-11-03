/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

export class BooleanExpressionParser extends ExpressionParser {
  evaluate(expression, values, defaultValues) {
    this.setScopeVariables(values, defaultValues);

    return evaluate(expression);
  }
}
