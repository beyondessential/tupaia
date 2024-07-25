/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { hasContent, ValidationError } from '@tupaia/utils';
import { JsonFieldValidator } from '../JsonFieldValidator';
import { convertCellToJson } from '../../utilities';

export class UserConfigValidator extends JsonFieldValidator {
  constructor(questions, models) {
    super(questions);
    this.models = models;
  }

  static fieldName = 'config';

  getFieldValidators(rowIndex) {
    const isPermissionGroupOrPointsToMandatoryQuestion =
      this.constructIsPermissionGroupOrPointsToPreceedingMandatoryQuestion(rowIndex);

    return {
      permissionGroup: [hasContent, isPermissionGroupOrPointsToMandatoryQuestion],
    };
  }

  constructIsPermissionGroupOrPointsToPreceedingMandatoryQuestion = rowIndex => {
    return value => {
      const questionCode = value;
      const question = this.findOtherQuestion(questionCode, rowIndex, this.questions.length);

      if (!question) {
        const isValidPermissionGroup = this.models.permissionGroup.findOne({ name: value });
        if (isValidPermissionGroup) {
          return true;
        }
        throw new ValidationError(
          `Permission group should be a valid permission group or reference a preceeding question in the survey`,
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
