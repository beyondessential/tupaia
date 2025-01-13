import { ExpressionParser } from './ExpressionParser';

export class BooleanExpressionParser extends ExpressionParser {
  /**
   * Return custom functions that we want to import
   */
  getCustomFunctions() {
    return {
      ...super.getCustomFunctions(),
      matchRegex: (value, regex) => !!value.match(regex),
    };
  }
}
