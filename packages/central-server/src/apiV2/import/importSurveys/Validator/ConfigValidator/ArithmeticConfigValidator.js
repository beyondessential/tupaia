import { constructIsNotPresentOr, hasContent, ValidationError } from '@tupaia/utils';
import { CalculatedConfigValidator } from './CalculatedConfigValidator';
import {
  splitStringOn,
  splitStringOnComma,
  getDollarPrefixedExpressionVariables,
} from '../../../../utilities';
import { isEmpty } from '../../utilities';
import { ANSWER_TYPES } from '../../../../../database/models/Answer';

const { NUMBER, ARITHMETIC } = ANSWER_TYPES;
const NUMERIC_QUESTION_TYPES = [NUMBER, ARITHMETIC];

export class ArithmeticConfigValidator extends CalculatedConfigValidator {
  getFieldValidators(rowIndex) {
    const formulaPointsToOtherQuestions = this.constructFormulaPointsToOtherQuestions(rowIndex);

    return {
      formula: [hasContent, constructIsNotPresentOr(formulaPointsToOtherQuestions)],
      defaultValues: this.getDefaultValuesValidators(rowIndex),
      valueTranslation: this.getValueTranslationValidators(rowIndex),
      answerDisplayText: [constructIsNotPresentOr(hasContent)],
    };
  }

  /**
   * Return a list of all the required validators for defaultValues config
   * @param {*} rowIndex
   */
  getDefaultValuesValidators(rowIndex) {
    const existIfQuestionsInFormulaAreOptional =
      this.hasContentIfQuestionsInFormulaAreOptional(rowIndex);
    const defaultValuesPointToOtherQuestions =
      this.constructDefaultValuesPointToOtherQuestions(rowIndex);
    const defaultValuesProvidedForAllOptionalQuestions =
      this.constructDefaultValuesProvidedForAllOptionalQuestions(rowIndex);
    const defaultValuesAreNumeric = this.defaultValuesAreNumeric();

    return [
      existIfQuestionsInFormulaAreOptional,
      constructIsNotPresentOr(defaultValuesPointToOtherQuestions),
      constructIsNotPresentOr(defaultValuesProvidedForAllOptionalQuestions),
      constructIsNotPresentOr(defaultValuesAreNumeric),
    ];
  }

  /**
   * Return a list of all the required validators for valueTranslation config
   * @param {*} rowIndex
   */
  getValueTranslationValidators(rowIndex) {
    const existIfQuestionsInFormulaAreNonNumeric =
      this.hasContentIfQuestionsInFormulaAreNonNumeric(rowIndex);
    const valueTranslationPointToOtherQuestions =
      this.constructValueTranslationPointsToOtherQuestions(rowIndex);
    const valueTranslationProvidedForAllNonNumericQuestions =
      this.constructTranslationProvidedForAllNonNumericQuestions(rowIndex);
    const valueTranslationsAreNumeric = this.valueTranslationsAreNumeric();

    return [
      existIfQuestionsInFormulaAreNonNumeric,
      constructIsNotPresentOr(valueTranslationPointToOtherQuestions),
      constructIsNotPresentOr(valueTranslationProvidedForAllNonNumericQuestions),
      constructIsNotPresentOr(valueTranslationsAreNumeric),
    ];
  }

  /**
   * When any questions used in the formula are non numeric, users need to provide 'valueTranslation'
   * to translate the raw answers into numbers so that arithmetic calculation can be done.
   * @param {*} rowIndex
   */
  hasContentIfQuestionsInFormulaAreNonNumeric(rowIndex) {
    return (value, object, key) => {
      const { formula } = object;
      const nonNumericQuestions = this.getNonNumericQuestionsInFormula(formula, rowIndex);
      if (nonNumericQuestions.length) {
        if (!object.hasOwnProperty(key) || isEmpty(value)) {
          throw new Error(
            'Should not be empty if any questions used in the formula are non numeric',
          );
        }
      }

      return true;
    };
  }

  /**
   * When any questions used in the formula are optional, users need to provide 'defaultValues'
   * so that if the optional question is not answered, a default value can be used.
   * @param {*} rowIndex
   */
  hasContentIfQuestionsInFormulaAreOptional(rowIndex) {
    return (value, object, key) => {
      const { formula } = object;
      this.assertHasContentIfQuestionsInFormulaAreOptional(formula, object, value, key, rowIndex);
      return true;
    };
  }

  /**
   * Return all the questions used in the formula that are non numeric.
   * @param {*} formula
   * @param {*} rowIndex
   */
  getNonNumericQuestionsInFormula(formula, rowIndex) {
    const codes = getDollarPrefixedExpressionVariables(formula);

    return codes.filter(code => {
      const questionType = this.getPrecedingQuestionField(code, rowIndex, 'type');
      return !NUMERIC_QUESTION_TYPES.includes(questionType);
    });
  }

  constructFormulaPointsToOtherQuestions(rowIndex) {
    return value => {
      const codes = getDollarPrefixedExpressionVariables(value);

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

  /**
   * Validate if, for any optional questions, there are corresponding default values so that if optional questions are not answered, default values can be populated.
   * @param {*} rowIndex
   */
  constructDefaultValuesProvidedForAllOptionalQuestions(rowIndex) {
    return (value, object) => {
      const { formula } = object;
      const defaultValues = splitStringOnComma(value);
      const optionalQuestionCodes = this.getOptionalQuestionsInFormula(formula, rowIndex);
      const defaultValueQuestionCodes = defaultValues.map(v => {
        const [code] = splitStringOn(v, ':');
        return code;
      });
      this.assertCollectionIncludesAnotherCollection(
        defaultValueQuestionCodes,
        optionalQuestionCodes,
        'Missing default value for optional question',
      );

      return true;
    };
  }

  /**
   * Validate if all the default values are numeric (required for arithmetic calc).
   */
  defaultValuesAreNumeric = () => {
    return value => {
      const defaultValues = splitStringOnComma(value);

      for (const defaultValuePair of defaultValues) {
        const [code, defaultValue] = splitStringOn(defaultValuePair, ':');
        if (Number.isNaN(defaultValue)) {
          throw new ValidationError(
            `Default values must be numeric. Found non numeric value '${defaultValue}'`,
          );
        }
      }

      return true;
    };
  };

  constructValueTranslationPointsToOtherQuestions(rowIndex) {
    return value => {
      const valueTranslation = splitStringOnComma(value);

      for (const translation of valueTranslation) {
        const [code] = splitStringOn(translation, ':');
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

  /**
   * Validate if, for any non numeric questions, there are corresponding value translations so that non numeric answer can be translated into numeric values.
   * @param {*} rowIndex
   */
  constructTranslationProvidedForAllNonNumericQuestions(rowIndex) {
    return (value, object) => {
      const { formula } = object;
      const valueTranslation = splitStringOnComma(value);
      const nonNumericQuestionCodes = this.getNonNumericQuestionsInFormula(formula, rowIndex);
      const valueTranslationCodes = valueTranslation.map(v => {
        const [key] = splitStringOn(v, ':');
        const [questionCode] = splitStringOn(key, '.');
        return questionCode;
      });
      this.assertCollectionIncludesAnotherCollection(
        valueTranslationCodes,
        nonNumericQuestionCodes,
        'Missing value translation for non numeric question',
      );

      return true;
    };
  }

  /**
   * Validate if all the value translations are numeric (required for arithmetic calc).
   */
  valueTranslationsAreNumeric = () => {
    return value => {
      const valueTranslation = splitStringOnComma(value);
      for (const translation of valueTranslation) {
        const [code, translatedValue] = splitStringOn(translation, ':');
        if (Number.isNaN(translatedValue)) {
          throw new ValidationError(
            `Translated values must be numeric. Found non numeric value '${translatedValue}'`,
          );
        }
      }

      return true;
    };
  };
}
