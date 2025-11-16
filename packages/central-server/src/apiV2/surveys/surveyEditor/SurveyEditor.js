import { ensure } from '@tupaia/tsutils';
import { ImportValidationError } from '@tupaia/utils';
import { validateSurveyFields } from '../../../dataAccessors';
import { assertAnyPermissions, assertBESAdminAccess } from '../../../permissions';
import { importSurveysQuestions } from '../../import/importSurveys';
import { getArrayQueryParameter } from '../../utilities';
import { assertCanImportSurvey } from '../assertCanImportSurvey';
import { updateDataElementsConfig } from './updateDataElementsConfig';
import { updateOrCreateDataGroup } from './updateOrCreateDataGroup';
import { validateSurveyCountries } from './validateSurveyCountries';
import { validateSurveyServiceType } from './validateSurveyServiceType';

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
      project_id: projectId,
    } = fields;

    // We use code for both create & edit.
    // In create it will be present as it is required by validation.
    // In edit it will only be present if we changed it, so we must fetch it from the existing survey.
    const existingSurvey = surveyId ? await transactingModels.survey.findById(surveyId) : null;
    const surveyCode = code ?? existingSurvey.code;

    // if the user is trying to remove the project from the survey, throw an error
    if (existingSurvey) {
      if (projectId === null || projectId === '') {
        throw new Error('Surveys must have a project');
      }

      if (code === null || code === '') {
        throw new Error('Survey code is required');
      }

      if (permissionGroupId === null || permissionGroupId === '') {
        throw new Error('Permission group is required');
      }

      if (name === null || name === '') {
        throw new Error('Survey name is required');
      }

      if (countryIds === null || countryIds === '' || (countryIds && countryIds.length === 0)) {
        throw new Error('Survey must be associated with at least one country');
      }
    }

    let permissionGroup;
    if (permissionGroupId) {
      permissionGroup = ensure(
        await transactingModels.permissionGroup.findByIdOrThrow(permissionGroupId),
      );
    } else if (existingSurvey) {
      permissionGroup = ensure(
        await transactingModels.permissionGroup.findByIdOrThrow(existingSurvey.permission_group_id),
      );
    } else {
      // Must be a create, and no permission group specified, use Public
      permissionGroup = ensure(
        await transactingModels.permissionGroup.findOne({ name: 'Public' }),
        `Couldn’t find Public permission group`,
      );
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

    if (countryIds || projectId) {
      const surveyProjectId = projectId ?? existingSurvey?.project_id;

      const countryIdsToValidate = countryIds ?? existingSurvey?.country_ids;
      await validateSurveyCountries(
        transactingModels,
        surveyId,
        countryIdsToValidate,
        surveyProjectId,
      );
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
        project_id: projectId,
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
    if (projectId !== undefined) {
      fieldsToForceUpdate.project_id = projectId;
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
     * importSurveyQuestions() will upsert data elements with matching config and service type to the data group.
     * We will then need to update these data elements to have the correct config.
     *   - The responsibility lays on SurveyEditor rather than importSurveyQuestions because
     *     importSurveyQuestions only really cares about survey screens and questions, and runs when these change,
     *     whereas SurveyEditor can persist a change to the data service without changing the questions of the survey.
     */
    await updateDataElementsConfig(transactingModels, dataGroup);
  }
}
