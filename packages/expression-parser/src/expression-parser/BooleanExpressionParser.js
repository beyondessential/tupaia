/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { ExpressionParser } from './ExpressionParser';

export class BooleanExpressionParser extends ExpressionParser {
  constructor() {
    super();
    this.importFunctions();
  }

  importFunctions() {
    this.importMatchRegexFunction();
  }

  // Expression can be: 'matchRegex("abc", "a")'
  importMatchRegexFunction() {
    this.math.import({
      matchRegex: (value, regex) => !!value.match(regex),
    });
  }
}
