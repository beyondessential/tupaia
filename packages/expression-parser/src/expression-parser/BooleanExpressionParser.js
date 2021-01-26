/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

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
