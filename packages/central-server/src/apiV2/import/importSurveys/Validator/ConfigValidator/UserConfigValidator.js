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
    const permissionGroupIsValidForTaskQuestion =
      this.permissionGroupIsValidForTaskQuestion(rowIndex);

    return {
      permissionGroup: [hasContent, isPermissionGroup, permissionGroupIsValidForTaskQuestion],
    };
  }

  /**
   * Checks if the permission group specified has access to the survey specified in the task question, if it exists
   */
  permissionGroupIsValidForTaskQuestion = rowIndex => {
    return async value => {
      const currentQuestion = this.getQuestion(rowIndex);
      const taskQuestion = this.questions.find(({ type, config }) => {
        if (type !== 'Task') return false;
        const parsedConfig = convertCellToJson(config);
        return parsedConfig.assignee === currentQuestion.code;
      });

      // if there is no task question, return true because this validation is not relevant
      if (!taskQuestion) return true;

      const { config } = taskQuestion;
      if (!config) {
        throw new ValidationError(
          "Can't validate permissionGroup: Task question should have config with survey code",
        );
      }
      const parsedConfig = convertCellToJson(config);
      const { surveyCode } = parsedConfig;
      const survey = await this.models.survey.findOne({ code: surveyCode });

      if (!survey) {
        throw new ValidationError(
          "Can't validate permissionGroup: Referenced survey in task question config does not exist",
        );
      }

      // BES Admin has access to all surveys
      if (value === 'BES Admin') return true;

      // Check if the permission group has access to the survey
      const { permission_group_id: permissionGroupId } = survey;

      const surveyPermissionGroup = await this.models.permissionGroup.findOne({
        id: permissionGroupId,
      });

      // Get the ancestors of the permission group
      const surveyPermissionGroupAncestors = await surveyPermissionGroup.getAncestors();

      const allowedPermissionGroups = [
        surveyPermissionGroup.name,
        ...surveyPermissionGroupAncestors.map(({ name }) => name),
      ];

      // Check if the permission group is in the allowed permission groups, if not throw an error
      if (!allowedPermissionGroups.some(name => name === value)) {
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
