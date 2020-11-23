/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { constructIsNotPresentOr, hasContent } from '@tupaia/utils';
import { JsonFieldValidator } from '../JsonFieldValidator';
import { splitStringOn, splitStringOnComma, getExpressionQuestionCodes } from '../../../utilities';
import { isEmpty } from '../../utilities';

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
    const existIfQuestionsInFormulaAreNonNumeric = this.hasContentIfQuestionsInFormulaAreNonNumeric(
      rowIndex,
    );
    const valueTranslationPointToOtherQuestions = this.constructValueTranslationPointsToOtherQuestions(
      rowIndex,
    );

    return {
      formula: [constructIsNotPresentOr(formulaPointsToOtherQuestions)],
      defaultValues: [constructIsNotPresentOr(defaultValuesPointToOtherQuestions)],
      valueTranslation: [
        existIfQuestionsInFormulaAreNonNumeric,
        constructIsNotPresentOr(valueTranslationPointToOtherQuestions),
      ],
      answerDisplayText: [constructIsNotPresentOr(hasContent)],
    };
  }

  /**
   * When any questions used in the formula are non numeric, users need to provide 'valueTranslation'
   * to translate the raw answers into numbers so that arithmetic calculation can be done.
   * @param {*} rowIndex
   */
  hasContentIfQuestionsInFormulaAreNonNumeric(rowIndex) {
    return (value, object, key) => {
      const { formula } = object;
      const questionsInFormulaAreNumeric = this.checkQuestionsInFormulaAreNumeric(
        formula,
        rowIndex,
      );
      if (!questionsInFormulaAreNumeric) {
        if (!object.hasOwnProperty(key) || isEmpty(value)) {
          throw new Error(
            'Should not be empty if any questions used in the formula are not numeric',
          );
        }
      }

      return true;
    };
  }

  checkQuestionsInFormulaAreNumeric(formula, rowIndex) {
    const codes = getExpressionQuestionCodes(formula);

    for (const code of codes) {
      const questionType = this.getPrecedingQuestionField(code, rowIndex, 'type');

      if (questionType !== 'Number') {
        return false;
      }
    }

    return true;
  }

  constructFormulaPointsToOtherQuestions(rowIndex) {
    return value => {
      const codes = getExpressionQuestionCodes(value);

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
