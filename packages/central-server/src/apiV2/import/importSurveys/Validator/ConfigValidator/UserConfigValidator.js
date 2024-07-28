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
    const isPermissionGroup = this.constructIsPermissionGroup(rowIndex);
    const permissionGroupIsValidForTaskQuestion = this.permissionGroupIsValidForTaskQuestion();

    return {
      permissionGroup: [hasContent, isPermissionGroup, permissionGroupIsValidForTaskQuestion],
    };
  }

  permissionGroupIsValidForTaskQuestion = () => {
    return async value => {
      const taskQuestion = this.questions.find(({ type }) => type === 'Task');

      // if there is no task question, return true because this validation is not relevant
      if (!taskQuestion) return true;

      const { config } = taskQuestion;
      if (!config) {
        throw new ValidationError('Task question should have config');
      }
      const parsedConfig = convertCellToJson(config);
      const { surveyCode } = parsedConfig;
      const survey = await this.models.survey.findOne({ code: surveyCode });

      if (!survey) {
        throw new ValidationError('Referenced survey does not exist');
      }

      const permissionGroup = await this.models.permissionGroup.findOne({ name: value });

      const permissionGroupWithAncestors = await permissionGroup.getAncestors();

      const { permission_group_id: permissionGroupId } = survey;

      if (!permissionGroupWithAncestors.some(({ id }) => id === permissionGroupId)) {
        throw new ValidationError(
          'Permission group does not have access to the referenced survey in the task question',
        );
      }
    };
  };

  constructIsPermissionGroup = () => {
    return async value => {
      const permissionGroup = await this.models.permissionGroup.findOne({ name: value });
      if (!permissionGroup) {
        throw new ValidationError('Referenced permission group does not exist');
      }

      return true;
    };
  };
}
