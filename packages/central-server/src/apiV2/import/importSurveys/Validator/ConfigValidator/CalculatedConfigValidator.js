import { ValidationError } from '@tupaia/utils';
import { JsonFieldValidator } from '../JsonFieldValidator';
import { getDollarPrefixedExpressionVariables } from '../../../../utilities';
import { isEmpty, convertCellToJson } from '../../utilities';

/**
 * Base class for questions that automatically generate answers by evaluating expressions.
 */
export class CalculatedConfigValidator extends JsonFieldValidator {
  static fieldName = 'config';

  constructor(questions, models) {
    super(questions);
    this.models = models;
  }

  assertHasContentIfQuestionsInFormulaAreOptional(formula, object, value, key, rowIndex) {
    const optionalQuestions = this.getOptionalQuestionsInFormula(formula, rowIndex);
    if (optionalQuestions.length) {
      if (!object.hasOwnProperty(key) || isEmpty(value)) {
        throw new Error('Should not be empty if any questions used in the formula are optional');
      }
    }
  }

  getOptionalQuestionsInFormula(formula, rowIndex) {
    const codes = getDollarPrefixedExpressionVariables(formula);

    return codes.filter(code => {
      const validationCriteriaCell = this.getPrecedingQuestionField(
        code,
        rowIndex,
        'validationCriteria',
      );
      if (validationCriteriaCell) {
        const validationCriteria = convertCellToJson(validationCriteriaCell);
        if (validationCriteria.mandatory === 'true') {
          return false;
        }
      }

      return true;
    });
  }

  assertCollectionIncludesAnotherCollection(mainCollection, subCollection, errorMessage) {
    subCollection.forEach(code => {
      if (!mainCollection.includes(code)) {
        throw new ValidationError(`${errorMessage}: '${code}'`);
      }
    });
  }
}
