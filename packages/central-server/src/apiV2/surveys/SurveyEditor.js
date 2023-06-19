/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { DatabaseError, ImportValidationError } from '@tupaia/utils';
import { validateSurveyFields } from '../../dataAccessors';
import { getArrayQueryParameter } from '../utilities';
import { assertAnyPermissions, assertBESAdminAccess } from '../../permissions';
import { assertCanImportSurvey } from './assertCanImportSurvey';
import { importSurveysQuestions } from '../import/importSurveys';
import { assertCanAddDataElementInGroup } from './assertCanAddDataElementInGroup';

const validateSurveyServiceType = async (models, surveyId, serviceType) => {
  if (!surveyId) return;
  const survey = await models.survey.findById(surveyId);

  const existingDataGroup = await models.dataGroup.findOne({ code: survey.code });
  if (existingDataGroup !== null) {
    if (serviceType !== existingDataGroup.service_type) {
      throw new ImportValidationError(
        `Data service must match. The existing survey has Data service: ${existingDataGroup.service_type}. Attempted to import with Data service: ${serviceType}.`,
      );
    }
  }
};

/**
 * Given a data group, sets the config for those data elements to match (service type / dhis instance code etc).
 */
const updateDataElementsConfig = async (models, dataGroup) => {
  const { service_type: serviceType, config } = dataGroup;

  const dataElementIds = (
    await models.dataElementDataGroup.find({ data_group_id: dataGroup.id })
  ).map(row => row.data_element_id);

  for (const dataElementId of dataElementIds) {
    const dataElement = await models.dataElement.findById(dataElementId);

    await assertCanAddDataElementInGroup(models, dataElement.code, dataGroup.code, {
      service_type: serviceType,
      config,
    });

    dataElement.service_type = serviceType;
    dataElement.config = config;

    dataElement.sanitizeConfig();
    await dataElement.save();
  }
};

const updateOrCreateDataGroup = async (
  models,
  surveyId,
  { surveyCode, serviceType, dhisInstanceCode },
) => {
  const survey = surveyId ? await models.survey.findById(surveyId) : null;
  const existingDataGroup = survey ? await models.dataGroup.findOne({ code: survey.code }) : null;

  let dataGroup = existingDataGroup;
  if (existingDataGroup !== null) {
    dataGroup.code = surveyCode;
    if (serviceType) dataGroup.service_type = serviceType;
    if (dhisInstanceCode) {
      dataGroup.config = { dhisInstanceCode };
    }
  } else {
    dataGroup = await models.dataGroup.create({
      code: surveyCode,
      service_type: serviceType,
      config: { dhisInstanceCode },
    });
  }

  dataGroup.sanitizeConfig();
  await dataGroup.save();

  return dataGroup;
};

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
      permission_group_id,
      country_ids,
      can_repeat,
      survey_group_id,
      integration_metadata,
      period_granularity,
      requires_approval,
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
    const permissionGroup = permission_group_id
      ? await transactingModels.permissionGroup.findById(permission_group_id)
      : defaultPermissionGroup;
    if (!permissionGroup) {
      throw new DatabaseError('finding permission group');
    }

    // TODO: merge this with surveyChecker
    const importSurveysPermissionsChecker = async accessPolicy =>
      assertCanImportSurvey(accessPolicy, transactingModels, surveyId, country_ids);

    await this.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess, importSurveysPermissionsChecker]),
    );

    let surveyGroup;
    if (survey_group_id) {
      surveyGroup = await transactingModels.surveyGroup.findById(survey_group_id);
    }

    const { dhisInstanceCode = '' } = dataGroupConfig;

    if (serviceType) {
      await validateSurveyServiceType(transactingModels, surveyId, serviceType);
    }

    try {
      await validateSurveyFields(transactingModels, surveyId, {
        code: surveyCode,
        serviceType,
        periodGranularity: period_granularity,
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
    if (country_ids !== undefined) {
      // Set the countries this survey is available in
      fieldsToForceUpdate.country_ids = getArrayQueryParameter(country_ids);
    }
    if (survey_group_id !== undefined) {
      if (survey_group_id === null) {
        fieldsToForceUpdate.survey_group_id = null;
      } else {
        fieldsToForceUpdate.survey_group_id = surveyGroup.id;
      }
    }
    if (permission_group_id !== undefined) {
      if (permission_group_id === null) {
        fieldsToForceUpdate.permission_group_id = null;
      } else {
        // A non-default permission group was provided
        fieldsToForceUpdate.permission_group_id = permissionGroup.id;
      }
    }
    if (name !== undefined) {
      fieldsToForceUpdate.name = name;
    }
    if (period_granularity !== undefined) {
      fieldsToForceUpdate.period_granularity =
        period_granularity === '' ? null : period_granularity;
    }
    if (requires_approval !== undefined) {
      fieldsToForceUpdate.requires_approval = requires_approval;
    }
    if (can_repeat !== undefined) {
      fieldsToForceUpdate.can_repeat = can_repeat;
    }
    if (integration_metadata !== undefined) {
      fieldsToForceUpdate.integration_metadata = integration_metadata;
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
