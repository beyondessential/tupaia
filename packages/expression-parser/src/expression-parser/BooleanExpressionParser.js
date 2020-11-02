/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

export class BooleanExpressionParser extends ExpressionParser {
  evaluate(expression, values, defaultValues) {
    Object.entries(values).forEach(([variableName, value]) => {
      const expressionValue = value || defaultValues[variableName];
      this.setScopeVariable(variableName, expressionValue);
    });

    return evaluate(expression);
  }
}
