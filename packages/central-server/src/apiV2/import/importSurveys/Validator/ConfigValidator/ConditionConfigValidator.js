import { constructIsNotPresentOr, hasContent } from '@tupaia/utils';
import { CalculatedConfigValidator } from './CalculatedConfigValidator';
import {
  splitStringOn,
  splitStringOnComma,
  getDollarPrefixedExpressionVariables,
} from '../../../../utilities';

export class ConditionConfigValidator extends CalculatedConfigValidator {
  getFieldValidators(rowIndex) {
    const conditionsPointToOtherQuestions = this.constructConditionsPointToOtherQuestions(rowIndex);

    return {
      conditions: [hasContent, constructIsNotPresentOr(conditionsPointToOtherQuestions)],
      defaultValues: this.getDefaultValuesValidators(rowIndex),
    };
  }

  getDefaultValuesValidators(rowIndex) {
    const existIfQuestionsInFormulaAreOptional = this.hasContentIfQuestionsInFormulaAreOptional(
      rowIndex,
    );
    const defaultValuesPointToOtherQuestions = this.constructDefaultValuesPointToOtherQuestions(
      rowIndex,
    );
    const defaultValuesProvidedForAllOptionalQuestions = this.constructDefaultValuesProvidedForAllOptionalQuestions(
      rowIndex,
    );

    return [
      existIfQuestionsInFormulaAreOptional,
      constructIsNotPresentOr(defaultValuesPointToOtherQuestions),
      constructIsNotPresentOr(defaultValuesProvidedForAllOptionalQuestions),
    ];
  }

  /**
   * When any questions used in the formula are optional, users need to provide 'defaultValues'
   * so that if the optional question is not answered, a default value can be used.
   * @param {*} rowIndex
   */
  hasContentIfQuestionsInFormulaAreOptional(rowIndex) {
    return (value, object, key) => {
      const { conditions: conditionsString } = object;
      const conditions = splitStringOnComma(conditionsString);

      for (const condition of conditions) {
        const [, expression] = splitStringOn(condition, ':');
        this.assertHasContentIfQuestionsInFormulaAreOptional(
          expression,
          object,
          value,
          key,
          rowIndex,
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
      const { conditions } = object;
      const defaultValues = splitStringOnComma(value);
      const resultValueToExpression = {};
      const resultValueToCodes = {};

      for (const condition of conditions) {
        const [targetValue, expression] = splitStringOn(condition, ':');
        resultValueToExpression[targetValue] = expression;
      }

      for (const defaultValue of defaultValues) {
        const [key] = splitStringOn(defaultValue, ':');
        const [targetValue, code] = splitStringOn(key, '.');
        if (!resultValueToCodes[targetValue]) {
          resultValueToCodes[targetValue] = [];
        }

        resultValueToCodes[targetValue].push(code);
      }

      Object.entries(resultValueToCodes).forEach(([resultValue, codes]) => {
        const expression = resultValueToExpression[resultValue];
        if (expression) {
          const optionalQuestionCodes = this.getOptionalQuestionsInFormula(expression, rowIndex);
          this.assertCollectionIncludesAnotherCollection(
            codes,
            optionalQuestionCodes,
            'Missing default value for optional question',
          );
        }
      });

      return true;
    };
  }

  constructConditionsPointToOtherQuestions(rowIndex) {
    return value => {
      const conditions = splitStringOnComma(value);

      for (const condition of conditions) {
        const [, expression] = splitStringOn(condition, ':');
        const codes = getDollarPrefixedExpressionVariables(expression);

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
      const defaultValues = splitStringOnComma(value);

      for (const defaultValue of defaultValues) {
        const [key] = splitStringOn(defaultValue, ':');
        const [, code] = splitStringOn(key, '.');

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
