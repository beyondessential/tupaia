/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { hasContent, ValidationError } from '@tupaia/utils';
import { JsonFieldValidator } from '../JsonFieldValidator';
import { convertCellToJson } from '../../utilities';

export class TaskConfigValidator extends JsonFieldValidator {
  constructor(questions, models) {
    super(questions);
    this.models = models;
  }

  static fieldName = 'config';

  getFieldValidators(rowIndex) {
    return {
      entityCode: [
        hasContent,
        this.constructIsExistingRecordOrPointsToPreceedingMandatoryQuestion(
          rowIndex,
          'entityCode',
          'entity',
        ),
      ],
      surveyCode: [
        hasContent,
        this.constructReferencesExistingRecord('survey', 'code', 'surveyCode'),
      ],
    };
  }

  constructReferencesExistingRecord = (recordType, field, configFieldName) => {
    return value => {
      const isValidRecord = this.models[recordType].findOne({ [field]: value });
      if (!isValidRecord) {
        throw new ValidationError(`${configFieldName} should reference a valid ${recordType}`);
      }
      return true;
    };
  };

  constructIsExistingRecordOrPointsToPreceedingMandatoryQuestion = (
    rowIndex,
    fieldName,
    recordType,
  ) => {
    return value => {
      const questionCode = value;
      const question = this.findOtherQuestion(questionCode, rowIndex, this.questions.length);

      if (!question) {
        const isValidRecord = this.models[recordType].findOne({ name: value });
        if (isValidRecord) {
          return true;
        }
        throw new ValidationError(
          `${fieldName} should reference a valid ${recordType} or reference a preceeding question in the survey`,
        );
      }

      if (!question.validationCriteria) {
        throw new ValidationError(`Referenced question should be mandatory`);
      }

      const { validationCriteria } = question;
      const parsedValidationCriteria = convertCellToJson(validationCriteria);

      if (!parsedValidationCriteria.mandatory || parsedValidationCriteria.mandatory !== 'true') {
        throw new ValidationError(`Referenced question should be mandatory`);
      }

      return true;
    };
  };
}
