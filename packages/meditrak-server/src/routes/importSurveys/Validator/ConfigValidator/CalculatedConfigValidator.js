/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { getVariables } from '@beyondessential/arithmetic';
import { constructIsNotPresentOr, constructIsOneOf, hasContent } from '@tupaia/utils';
import { JsonFieldValidator } from '../JsonFieldValidator';
import { splitStringOn, splitStringOnComma } from '../../../utilities';

export class CalculatedConfigValidator extends JsonFieldValidator {
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
    const conditionsPointToOtherQuestions = this.constructConditionsPointToOtherQuestions(rowIndex);

    return {
      type: [hasContent, constructIsOneOf(['arithmetic', 'condition'])],
      formula: [constructIsNotPresentOr(formulaPointsToOtherQuestions)],
      defaultValues: [constructIsNotPresentOr(defaultValuesPointToOtherQuestions)],
      valueTranslation: [constructIsNotPresentOr(valueTranslationPointToOtherQuestions)],
      conditions: [constructIsNotPresentOr(conditionsPointToOtherQuestions)],
    };
  }

  constructFormulaPointsToOtherQuestions(rowIndex) {
    return value => {
      const codes = getVariables(value);

      for (let i = 0; i < codes.length; i++) {
        const code = codes[i];
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

      for (let i = 0; i < defaultValues.length; i++) {
        const [code] = splitStringOn(defaultValues[i], '=');
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
        const [code] = splitStringOn(valueTranslation[i], '=');
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

  constructConditionsPointToOtherQuestions(rowIndex) {
    return value => {
      const conditions = splitStringOnComma(value);

      for (let i = 0; i < conditions.length; i++) {
        const [key] = splitStringOn(conditions[i], '=');
        const [finalValue, code] = splitStringOn(key, '.');
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
