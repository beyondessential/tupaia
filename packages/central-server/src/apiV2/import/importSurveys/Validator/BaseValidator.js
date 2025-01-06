import { ValidationError } from '@tupaia/utils';
import { convertCellToJson } from '../utilities';

export class BaseValidator {
  constructor(questions) {
    this.questions = questions;
  }

  /**
   * @abstract
   * @public
   *
   * @throws {Error}
   */
  validate() {
    throw new Error('Any subclass of BaseValidator must implement the "validate" method');
  }

  getQuestion(rowIndex) {
    return this.questions[rowIndex];
  }

  getField(rowIndex, fieldName) {
    const question = this.getQuestion(rowIndex);
    return question[fieldName];
  }

  findOtherQuestion(code, currentIndex, lastIndex) {
    return this.questions.slice(0, lastIndex).find(({ code: currentCode }, index) => {
      const hasTargetCode = currentCode === code;
      const isAnotherQuestion = index !== currentIndex;

      return hasTargetCode && isAnotherQuestion;
    });
  }

  constructPointsToAnotherQuestion(rowIndex) {
    return value => {
      const questionCode = value;
      const question = this.findOtherQuestion(questionCode, rowIndex, this.questions.length);

      if (!question) {
        throw new ValidationError(`Should reference another question in the survey`);
      }

      return true;
    };
  }

  assertPointingToPrecedingQuestion(
    questionCode,
    rowIndex,
    errorMessage = 'Should reference a preceding question',
  ) {
    const question = this.findOtherQuestion(questionCode, rowIndex, rowIndex);

    if (!question) {
      throw new ValidationError(errorMessage);
    }

    return true;
  }

  getPrecedingQuestionField(questionCode, rowIndex, fieldName) {
    const question = this.findOtherQuestion(questionCode, rowIndex, rowIndex);

    if (!question) {
      throw new ValidationError('Should reference a preceding question');
    }

    return question[fieldName];
  }
}
