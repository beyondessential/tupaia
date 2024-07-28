/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { ValidationError } from '@tupaia/utils';
import { JsonFieldValidator } from '../JsonFieldValidator';
import { convertCellToJson } from '../../utilities';

export class TaskConfigValidator extends JsonFieldValidator {
  constructor(questions, models) {
    super(questions);
    this.models = models;
  }

  static fieldName = 'config';

  getFieldValidators(rowIndex) {
    const pointsToPreceedingMandatoryQuestion =
      this.constructReferencesPreceedingMandatoryQuestion(rowIndex);
    const referencesExistingSurvey = this.constructReferencesExistingSurvey();

    return {
      shouldCreateTask: [pointsToPreceedingMandatoryQuestion],
      entityCode: [pointsToPreceedingMandatoryQuestion],
      surveyCode: [referencesExistingSurvey],
      dueDate: [pointsToPreceedingMandatoryQuestion],
      assignee: [pointsToPreceedingMandatoryQuestion],
    };
  }

  constructReferencesExistingSurvey = () => {
    return async value => {
      const isValidRecord = await this.models.survey.findOne({ code: value });

      if (!isValidRecord) {
        throw new ValidationError('Referenced survey does not exist');
      }
      return true;
    };
  };

  constructReferencesPreceedingMandatoryQuestion = rowIndex => {
    return value => {
      const question = this.findOtherQuestion(value, rowIndex, rowIndex);
      if (!question) {
        throw new ValidationError('Referenced question does not exist');
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
