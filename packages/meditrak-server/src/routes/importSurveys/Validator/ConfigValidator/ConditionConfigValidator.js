/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { ExpressionParser } from '@tupaia/expression-parser';
import { constructIsNotPresentOr } from '@tupaia/utils';
import { JsonFieldValidator } from '../JsonFieldValidator';
import { splitStringOn, splitStringOnComma } from '../../../utilities';

export class ConditionConfigValidator extends JsonFieldValidator {
  constructor(questions, models) {
    super(questions);
    this.models = models;
  }

  static fieldName = 'config';

  getFieldValidators(rowIndex) {
    const conditionsPointToOtherQuestions = this.constructConditionsPointToOtherQuestions(rowIndex);
    const defaultValuesPointToOtherQuestions = this.constructDefaultValuesPointToOtherQuestions(
      rowIndex,
    );

    return {
      conditions: [constructIsNotPresentOr(conditionsPointToOtherQuestions)],
      defaultValues: [constructIsNotPresentOr(defaultValuesPointToOtherQuestions)],
    };
  }

  constructConditionsPointToOtherQuestions(rowIndex) {
    const expressionParser = new ExpressionParser();
    return value => {
      const conditions = splitStringOnComma(value);

      for (const condition of conditions) {
        const [targetValue, expression] = splitStringOn(condition, ':');
        const variables = expressionParser.getVariables(expression);
        const codes = variables.map(variable => {
          if (!variable.match(/^\$/)) {
            throw new Error(`Variable ${variable} in formula must have prefix $`);
          }
          return variable.replace(/^\$/, '');
        });

        for (const code of codes) {
          this.assertPointingToPrecedingQuestion(
            code,
            rowIndex,
            `Code '${code}' does not reference a preceding question`,
          );
        }
      }

      return true;
    };
  }

  constructDefaultValuesPointToOtherQuestions(rowIndex) {
    return value => {
      const conditions = splitStringOnComma(value);

      for (const condition of conditions) {
        const [key] = splitStringOn(condition, ':');
        const [targetValue, code] = splitStringOn(key, '.');

        this.assertPointingToPrecedingQuestion(
          code,
          rowIndex,
          `Code '${code}' does not reference a preceding question`,
        );
      }

      return true;
    };
  }
}
