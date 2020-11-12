/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { ExpressionParser } from '@tupaia/expression-parser';
import { constructIsNotPresentOr, hasContent } from '@tupaia/utils';
import { JsonFieldValidator } from '../JsonFieldValidator';
import { splitStringOn, splitStringOnComma } from '../../../utilities';

export class ArithmeticConfigValidator extends JsonFieldValidator {
  constructor(questions, models) {
    super(questions);
    this.models = models;
  }

  static fieldName = 'config';

  getFieldValidators(rowIndex) {
    const formulaPointsToOtherQuestions = this.constructFormulaPointsToOtherQuestions(rowIndex);
    const defaultValuesPointToOtherQuestions = this.constructDefaultValuesPointToOtherQuestions(
      rowIndex,
    );
    const valueTranslationPointToOtherQuestions = this.constructValueTranslationPointsToOtherQuestions(
      rowIndex,
    );

    return {
      formula: [constructIsNotPresentOr(formulaPointsToOtherQuestions)],
      defaultValues: [constructIsNotPresentOr(defaultValuesPointToOtherQuestions)],
      valueTranslation: [constructIsNotPresentOr(valueTranslationPointToOtherQuestions)],
      answerDisplayText: [constructIsNotPresentOr(hasContent)],
    };
  }

  constructFormulaPointsToOtherQuestions(rowIndex) {
    const expressionParser = new ExpressionParser();
    return value => {
      const codes = expressionParser.getVariables(value);

      for (const code of codes) {
        this.assertPointingToPrecedingQuestion(
          code,
          rowIndex,
          `Code '${code}' does not reference a preceding question`,
        );
      }

      return true;
    };
  }

  constructDefaultValuesPointToOtherQuestions(rowIndex) {
    return value => {
      const defaultValues = splitStringOnComma(value);

      for (const defaultValue of defaultValues) {
        const [code] = splitStringOn(defaultValue, ':');
        this.assertPointingToPrecedingQuestion(
          code,
          rowIndex,
          `Code '${code}' does not reference a preceding question`,
        );
      }

      return true;
    };
  }

  constructValueTranslationPointsToOtherQuestions(rowIndex) {
    return value => {
      const valueTranslation = splitStringOnComma(value);

      for (let i = 0; i < valueTranslation.length; i++) {
        const [code] = splitStringOn(valueTranslation[i], ':');
        const [questionCode] = splitStringOn(code, '.');
        this.assertPointingToPrecedingQuestion(
          questionCode,
          rowIndex,
          `Code '${questionCode}' does not reference a preceding question`,
        );
      }

      return true;
    };
  }
}
