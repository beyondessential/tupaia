/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { ExpressionParser } from '@tupaia/expression-parser';

export const getExpressionQuestionCodes = expression => {
  const expressionParser = new ExpressionParser();
  const variables = expressionParser.getVariables(expression);
  return variables.map(variable => {
    if (!variable.match(/^\$/)) {
      throw new Error(`Variable ${variable} must have prefix $`);
    }
    return variable.replace(/^\$/, '');
  });
};
