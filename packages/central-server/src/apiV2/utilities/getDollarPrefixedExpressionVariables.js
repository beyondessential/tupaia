import { ExpressionParser } from '@tupaia/expression-parser';

export const getDollarPrefixedExpressionVariables = expression => {
  const expressionParser = new ExpressionParser();
  const variables = expressionParser.getVariables(expression);
  return variables.map(variable => {
    if (!variable.match(/^\$/)) {
      throw new Error(`Variable ${variable} must have prefix $`);
    }
    return variable.replace(/^\$/, '');
  });
};
