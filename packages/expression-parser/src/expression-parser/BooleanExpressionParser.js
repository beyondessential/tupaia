/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { ExpressionParser } from './ExpressionParser';

export class BooleanExpressionParser extends ExpressionParser {
  /**
   * Import any extra functions that we want to support
   */
  importFunctions() {
    this.importMatchRegexFunction();
  }

  /**
   * mathjs does not have any built in regex function.
   * Import this to support matching regex
   * Usage:
   * parser.set('x', '5');
   * parser.evaluate('matchRegex("x", "5")'); -> returns true
   * parser.evaluate('matchRegex("x", "1")'); -> returns false
   */
  importMatchRegexFunction() {
    this.math.import({
      matchRegex: (value, regex) => !!value.match(regex),
    });
  }
}
