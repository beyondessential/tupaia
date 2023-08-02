/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { DatabaseError, ImportValidationError } from '@tupaia/utils';
import { validateSurveyFields } from '../../../dataAccessors';
import { assertAnyPermissions, assertBESAdminAccess } from '../../../permissions';
import { getArrayQueryParameter } from '../../utilities';
import { importSurveysQuestions } from '../../import/importSurveys';
import { assertCanImportSurvey } from '../assertCanImportSurvey';
import { updateOrCreateDataGroup } from './updateOrCreateDataGroup';
import { validateSurveyServiceType } from './validateSurveyServiceType';
import { updateDataElementsConfig } from './updateDataElementsConfig';

export class SurveyEditor {
  constructor(models, assertPermissions) {
    this.models = models;
    this.assertPermissions = assertPermissions;
  }

  /**
   * @param {{}} fields
   * @return {Promise<void>}
   */
  async create(fields) {
    await this.models.wrapInTransaction(async transactingModels => {
      await this.upsert(transactingModels, fields);
    });
  }

  /**
   * @param {string} surveyId
   * @param {{}} fields
   * @return {Promise<void>}
   */
  async edit(surveyId, fields) {
    await this.models.wrapInTransaction(async transactingModels => {
      await this.upsert(transactingModels, fields, surveyId);
    });
  }

  /**
   * @param {} models
   * @param {{}} fields
   * @param {string} [surveyId]
   * @return {Promise<void>}
   * @private
   */
  async upsert(transactingModels, fields, surveyId) {
    const {
      code,
      name,
      permission_group_id: permissionGroupId,
      country_ids: countryIds,
      can_repeat: canRepeat,
      integration_metadata: integrationMetadata,
      period_granularity: periodGranularity,
      requires_approval: requiresApproval,
      'survey_group.name': surveyGroupName,
      'data_group.service_type': serviceType,
      'data_group.config': dataGroupConfig = {},
      surveyQuestions,
    } = fields;

    // We use code for both create & edit.
    // In create it will be present as it is required by validation.
    // In edit it will only be present if we changed it, so we must fetch it from the existing survey.
    const existingSurvey = surveyId ? await transactingModels.survey.findById(surveyId) : null;
    const surveyCode = code ?? existingSurvey.code;

    const defaultPermissionGroup = await transactingModels.permissionGroup.findOne({
      name: 'Public',
    });

    let permissionGroup;
    if (permissionGroupId) {
      permissionGroup = await transactingModels.permissionGroup.findById(permissionGroupId);
    } else if (existingSurvey) {
      permissionGroup = await transactingModels.permissionGroup.findById(
        existingSurvey.permission_group_id,
      );
    } else if (!existingSurvey) {
      // Must be a create, and no permission group specified, use Public
      permissionGroup = defaultPermissionGroup;
    }
    if (!permissionGroup) {
      throw new DatabaseError('finding permission group');
    }

    // TODO: merge this with surveyChecker
    const importSurveysPermissionsChecker = async accessPolicy =>
      assertCanImportSurvey(accessPolicy, transactingModels, surveyId, countryIds);

    await this.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess, importSurveysPermissionsChecker]),
    );

    const { dhisInstanceCode = '' } = dataGroupConfig;

    if (serviceType) {
      await validateSurveyServiceType(transactingModels, surveyId, serviceType);
    }

    try {
      await validateSurveyFields(transactingModels, surveyId, {
        code: surveyCode,
        serviceType,
        periodGranularity,
        dhisInstanceCode,
      });
    } catch (error) {
      throw new ImportValidationError(error.message);
    }

    const dataGroup = await updateOrCreateDataGroup(transactingModels, surveyId, {
      surveyCode,
      serviceType,
      dhisInstanceCode,
    });

    // Create the survey if it doesn't exist
    const survey =
      existingSurvey ??
      (await transactingModels.survey.create({
        code: surveyCode,
        name,
        permission_group_id: permissionGroup.id,
        data_group_id: dataGroup.id,
      }));

    // Work out what fields of the survey should be updated based on query params
    const fieldsToForceUpdate = {};
    if (surveyCode !== undefined) {
      // Set the countries this survey is available in
      fieldsToForceUpdate.code = surveyCode;
    }
    if (countryIds !== undefined) {
      // Set the countries this survey is available in
      fieldsToForceUpdate.country_ids = getArrayQueryParameter(countryIds);
    }
    if (surveyGroupName !== undefined) {
      if (surveyGroupName === null) {
        fieldsToForceUpdate.survey_group_id = null;
      } else {
        const surveyGroup = await this.models.surveyGroup.findOrCreate({ name: surveyGroupName });
        fieldsToForceUpdate.survey_group_id = surveyGroup.id;
      }
    }
    if (permissionGroupId !== undefined) {
      if (permissionGroupId === null) {
        fieldsToForceUpdate.permission_group_id = null;
      } else {
        // A non-default permission group was provided
        fieldsToForceUpdate.permission_group_id = permissionGroup.id;
      }
    }
    if (name !== undefined) {
      fieldsToForceUpdate.name = name;
    }
    if (periodGranularity !== undefined) {
      fieldsToForceUpdate.period_granularity = periodGranularity === '' ? null : periodGranularity;
    }
    if (requiresApproval !== undefined) {
      fieldsToForceUpdate.requires_approval = requiresApproval;
    }
    if (canRepeat !== undefined) {
      fieldsToForceUpdate.can_repeat = canRepeat;
    }
    if (integrationMetadata !== undefined) {
      fieldsToForceUpdate.integration_metadata = integrationMetadata;
    }
    // Update the survey based on the fields to force update
    if (Object.keys(fieldsToForceUpdate).length > 0) {
      await transactingModels.survey.update({ id: survey.id }, fieldsToForceUpdate);
    }

    // Import questions
    if (surveyQuestions) {
      await importSurveysQuestions({
        models: transactingModels,
        file: surveyQuestions,
        survey,
        dataGroup,
        permissionGroup,
      });
    }

    /*
     * importSurveyQuestions() will upsert data elements with default config (tupaia data service).
     * We will then need to update these data elements to have the correct config.
     *   - The responsibility lays on SurveyEditor rather than importSurveyQuestions because
     *     importSurveyQuestions only really cares about survey screens and questions, and runs when these change,
     *     whereas SurveyEditor can persist a change to the data service without changing the questions of the survey.
     */
    await updateDataElementsConfig(transactingModels, dataGroup);
  }
}
