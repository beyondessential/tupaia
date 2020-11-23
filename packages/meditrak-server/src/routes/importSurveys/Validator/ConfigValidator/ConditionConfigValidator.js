/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { constructIsNotPresentOr } from '@tupaia/utils';
import { JsonFieldValidator } from '../JsonFieldValidator';
import { splitStringOn, splitStringOnComma, getExpressionQuestionCodes } from '../../../utilities';

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
    return value => {
      const conditions = splitStringOnComma(value);

      for (const condition of conditions) {
        const [targetValue, expression] = splitStringOn(condition, ':');
        const codes = getExpressionQuestionCodes(expression);

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
