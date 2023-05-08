/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import {
  respond,
  DatabaseError,
  UploadError,
  ImportValidationError,
  ValidationError,
} from '@tupaia/utils';
import { validateSurveyFields } from '../../../dataAccessors';
import { getArrayQueryParameter } from '../../utilities';
import { assertAnyPermissions, assertBESAdminAccess } from '../../../permissions';
import { assertCanImportSurvey } from './assertCanImportSurvey';
import { importSurveysQuestions } from './importSurveyQuestions';

const DEFAULT_SERVICE_TYPE = 'tupaia';

const validateSurveyServiceType = async (models, surveyCode, serviceType) => {
  const existingDataGroup = await models.dataGroup.findOne({ code: surveyCode });
  if (existingDataGroup !== null) {
    if (serviceType !== existingDataGroup.service_type) {
      throw new ImportValidationError(
        `Data service must match. The existing survey has Data service: ${existingDataGroup.service_type}. Attempted to import with Data service: ${serviceType}.`,
      );
    }
  }
};

const updateOrCreateDataGroup = async (models, { surveyCode, serviceType, dhisInstanceCode }) => {
  const dataGroup = await models.dataGroup.findOrCreate(
    {
      code: surveyCode,
    },
    { service_type: serviceType, config: { dhisInstanceCode } },
  );

  dataGroup.sanitizeConfig();
  await dataGroup.save();

  return dataGroup;
};

/**
 * Responds to POST requests to the /surveys endpoint
 */
export async function importSurveys(req, res) {
  const { models } = req;
  if (!req.query?.surveyCode) {
    throw new ValidationError('surveyCode required');
  }
  const { surveyCode } = req.query;

  if (!req.file) {
    throw new UploadError();
  }
  try {
    await models.wrapInTransaction(async transactingModels => {
      const permissionGroup = await transactingModels.permissionGroup.findOne({
        name: req.query.permissionGroup || 'Public',
      });
      if (!permissionGroup) {
        throw new DatabaseError('finding permission group');
      }

      const importSurveysPermissionsChecker = async accessPolicy =>
        assertCanImportSurvey(accessPolicy, transactingModels, surveyCode, req.query.countryIds);

      await req.assertPermissions(
        assertAnyPermissions([assertBESAdminAccess, importSurveysPermissionsChecker]),
      );

      let surveyGroup;
      if (req.query.surveyGroup) {
        surveyGroup = await transactingModels.surveyGroup.findOrCreate({
          name: req.query.surveyGroup,
        });
      }

      const { serviceType = DEFAULT_SERVICE_TYPE, dhisInstanceCode = '' } = req.query;

      await validateSurveyServiceType(transactingModels, surveyCode, serviceType);

      try {
        await validateSurveyFields(transactingModels, {
          code: surveyCode,
          serviceType,
          periodGranularity: req.query.periodGranularity,
          dhisInstanceCode,
        });
      } catch (error) {
        throw new ImportValidationError(error.message);
      }

      const dataGroup = await updateOrCreateDataGroup(transactingModels, {
        surveyCode,
        serviceType,
        dhisInstanceCode,
      });


      // Get/Create the survey
      const survey = await transactingModels.survey.findOrCreate(
        {
          code: surveyCode,
        },
        {
          // If no survey with that name is found, give it a code and public permissions
          name: surveyCode,
          permission_group_id: permissionGroup.id,
          data_group_id: dataGroup.id,
        },
      );
      if (!survey) {
        throw new DatabaseError('creating survey, check format of import file');
      }


      // Work out what fields of the survey should be updated based on query params
      const fieldsToForceUpdate = {};
      if (req.query.countryIds) {
        // Set the countries this survey is available in
        fieldsToForceUpdate.country_ids = getArrayQueryParameter(req.query.countryIds);
      }
      if (surveyGroup) {
        fieldsToForceUpdate.survey_group_id = surveyGroup.id;
      }
      if (req.query.permissionGroup) {
        // A non-default permission group was provided
        fieldsToForceUpdate.permission_group_id = permissionGroup.id;
      }
      if (req.query.surveyName) {
        fieldsToForceUpdate.name = req.query.surveyName;
      }
      if (req.query.periodGranularity) {
        fieldsToForceUpdate.period_granularity = req.query.periodGranularity;
      }
      if (req.query.requiresApproval) {
        fieldsToForceUpdate.requires_approval = req.query.requiresApproval;
      }
      // Update the survey based on the fields to force update
      if (Object.keys(fieldsToForceUpdate).length > 0) {
        await transactingModels.survey.update({ id: survey.id }, fieldsToForceUpdate);
      }

      // Import questions
      await importSurveysQuestions({
        models: transactingModels,
        file: req.file,
        survey,
        dataGroup,
      });
    });
  } catch (error) {
    if (error.respond) {
      throw error; // Already a custom error with a responder
    }
    throw new DatabaseError('importing surveys', error);
  }
  respond(res, { message: 'Imported surveys' });
}
