/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { constructIsNotPresentOr, ValidationError } from '@tupaia/utils';
import { JsonFieldValidator } from '../JsonFieldValidator';
import { convertCellToJson } from '../../utilities';

export class TaskConfigValidator extends JsonFieldValidator {
  constructor(questions, models) {
    super(questions);
    this.models = models;
  }

  static fieldName = 'config';

  getFieldValidators(rowIndex) {
    const referencesExistingSurvey = this.constructReferencesExistingSurvey();

    const pointsToAnotherQuestion = this.constructReferencesPreceedingQuestion(rowIndex, ['User']);

    return {
      shouldCreateTask: [this.constructReferencesPreceedingMandatoryQuestion(rowIndex, ['Binary'])],
      entityId: [
        this.constructReferencesPreceedingMandatoryQuestion(rowIndex, ['Entity', 'PrimaryEntity']),
      ],
      surveyCode: [referencesExistingSurvey],
      dueDate: [
        this.constructReferencesPreceedingMandatoryQuestion(rowIndex, ['Date', 'DateTime']),
      ],
      assignee: [constructIsNotPresentOr(pointsToAnotherQuestion)],
    };
  }

  constructReferencesExistingSurvey = () => {
    return async value => {
      if (!value) {
        throw new ValidationError('Survey code is required');
      }
      const isValidRecord = await this.models.survey.findOne({ code: value });

      if (!isValidRecord) {
        throw new ValidationError('Referenced survey does not exist');
      }
      return true;
    };
  };

  constructReferencesPreceedingQuestion = (rowIndex, acceptedQuestionTypes) => {
    return value => {
      const question = this.findOtherQuestion(value, rowIndex, rowIndex);
      if (!question) {
        throw new ValidationError('Referenced question does not exist');
      }

      if (!acceptedQuestionTypes.includes(question.type)) {
        throw new ValidationError(
          `Referenced question should be of type ${acceptedQuestionTypes.join(' or ')}`,
        );
      }
      return true;
    };
  };

  constructReferencesPreceedingMandatoryQuestion = (rowIndex, acceptedQuestionTypes) => {
    return value => {
      const question = this.findOtherQuestion(value, rowIndex, rowIndex);
      if (!question) {
        throw new ValidationError('Referenced question does not exist');
      }

      if (!acceptedQuestionTypes.includes(question.type)) {
        throw new ValidationError(
          `Referenced question should be of type ${acceptedQuestionTypes.join(' or ')}`,
        );
      }

      if (!question.validationCriteria) {
        throw new ValidationError('Referenced question should be mandatory');
      }

      const { validationCriteria } = question;

      const parsedValidationCriteria = convertCellToJson(validationCriteria);

      if (!parsedValidationCriteria.mandatory || parsedValidationCriteria.mandatory !== 'true') {
        throw new ValidationError('Referenced question should be mandatory');
      }
      return true;
    };
  };
}
