import { flattenDeep, groupBy, keyBy } from 'es-toolkit/compat';

import { ensure, isNullish } from '@tupaia/tsutils';
import { getUniqueEntries, reduceToDictionary, ValidationError } from '@tupaia/utils';
import winston from '../../../log';

export const assertCanImportSurveyResponses = async (
  accessPolicy,
  models,
  entitiesBySurveyCode,
) => {
  const allEntityCodes = flattenDeep(Object.values(entitiesBySurveyCode));
  const surveyCodes = Object.keys(entitiesBySurveyCode);

  await models.wrapInReadOnlyTransaction(async transactingModels => {
    const [allEntities, surveys] = await Promise.all([
      transactingModels.entity.findManyByColumn('code', allEntityCodes),
      transactingModels.survey.findManyByColumn('code', surveyCodes),
    ]);

    if (allEntities.some(isNullish)) {
      winston.error('Unexpected nullish element in `allEntities`', { allEntities });
    }

    const codeToSurvey = keyBy(surveys, 'code');
    const surveyPermissionGroupIds = surveys.map(s => s.permission_group_id);
    const surveyPermissionGroups =
      await transactingModels.permissionGroup.findManyById(surveyPermissionGroupIds);
    const idToPermissionGroupName = reduceToDictionary(surveyPermissionGroups, 'id', 'name');

    for (const [surveyCode, entityCodes] of Object.entries(entitiesBySurveyCode)) {
      const survey = codeToSurvey[surveyCode];

      if (isNullish(survey)) {
        winston.error(`Unexpected nullish survey (code '${surveyCode}')`, { codeToSurvey });
      }

      const responseEntities = allEntities.filter(e => entityCodes.includes(e.code));
      const surveyResponseCountryCodes = [...new Set(responseEntities.map(e => e.country_code))];
      const surveyResponseCountries = await transactingModels.country.findManyByColumn(
        'code',
        surveyResponseCountryCodes,
      );

      if (surveyResponseCountries.some(isNullish)) {
        winston.error('Unexpected nullish element in `surveyResponseCountries`', {
          surveyResponseCountries,
        });
      }

      if (surveyResponseCountries.length !== surveyResponseCountryCodes.length) {
        const expected = surveyResponseCountryCodes;
        const actual = surveyResponseCountries.map(c => c.code);
        const difference = actual.filter(c => !expected.includes(c));
        throw new Error(
          `Couldn’t find the following countries: ${difference.join(', ')}`,
          surveyResponseCountryCodes,
        );
      }
      const entitiesByCountryCode = groupBy(responseEntities, 'country_code');

      for (const surveyResponseCountry of surveyResponseCountries) {
        // Check if the country of the submitted survey response(s) matches with the survey countries.
        if (survey.country_ids?.length && !survey.country_ids.includes(surveyResponseCountry.id)) {
          const surveyCountries = await transactingModels.country.findManyById(survey.country_ids);
          const entities = entitiesByCountryCode[surveyResponseCountry.code];

          if (entities.some(isNullish)) {
            winston.error('Unexpected nullish element in `entities`', { entities });
          }

          const entityCodesString = entities.map(e => e.code).join(', ');
          const surveyCountryNamesString = surveyCountries.map(s => s.name).join(', ');
          throw new Error(
            `Some survey response(s) are submitted against entity code(s) (${entityCodesString}) that do not belong to the countries (${surveyCountryNamesString}) of the survey '${survey.name}' (${survey.code})`,
          );
        }

        // Now check if users have permission group access to the survey response's country
        const permissionGroup = idToPermissionGroupName[survey.permission_group_id];
        if (!accessPolicy.allows(surveyResponseCountry.code, permissionGroup)) {
          throw new Error(
            `Need ${permissionGroup} access to ${surveyResponseCountry.name} to import the survey response(s)`,
          );
        }
      }
    }
  });

  return true;
};

const getEntityDoesExist = async (models, entityId) => {
  const [{ exists }] = await models.database.executeSql(
    'SELECT EXISTS(SELECT 1 FROM "entity" WHERE "id" = ?)',
    [entityId],
  );
  return exists;
};

/**
 * @returns {Promise<import('@tupaia/types').Entity['code'] | import('@tupaia/types').Clinic['code']>}
 */
const getEntityCodeFromSurveyResponseChange = async (models, surveyResponse, entitiesUpserted) => {
  // There are three valid ways to refer to the entity in a batch change:
  // entity_code, entity_id, clinic_id
  if (surveyResponse.entity_code) {
    return surveyResponse.entity_code;
  }

  if (surveyResponse.entity_id) {
    const newEntity = entitiesUpserted.find(e => e.id === surveyResponse.entity_id);

    const isSubmittingAgainstNewEntity =
      // Submitting response against upserted entity...
      newEntity !== undefined &&
      // ...that doesn’t yet exist in database
      !(await getEntityDoesExist(models, surveyResponse.entity_id));

    if (isSubmittingAgainstNewEntity) {
      // Submitting against new entity created by this response that doesn’t yet exist in remote
      // database. Instead, check permissions against the new entity’s parent.

      /** @type {import('@tupaia/database').EntityRecord} */
      const parentEntity = ensure(
        await models.entity.findById(newEntity.parent_id, { columns: ['code'] }),
        `Couldn’t check permissions for parent entity of entity ${newEntity.code}. No entity exists with ID ${newEntity.parent_id}.`,
      );
      return parentEntity.code;
    }

    /** @type {import('@tupaia/database').EntityRecord} */
    const entity = ensure(
      await models.entity.findById(surveyResponse.entity_id, { columns: ['code'] }),
      `No entity exists with ID ${surveyResponse.entity_id}`,
    );
    return entity.code;
  }

  if (surveyResponse.clinic_id) {
    /** @type {import('@tupaia/database').FacilityRecord} */
    const clinic = ensure(
      await models.facility.findById(surveyResponse.clinic_id),
      `No clinic exists with ID ${surveyResponse.clinic_id}`,
    );
    return clinic.code;
  }

  throw new ValidationError('Survey response change does not contain valid entity reference');
};

export const assertCanSubmitSurveyResponses = async (accessPolicy, models, surveyResponses) => {
  // Assumes the data has already been validated
  const entitiesBySurveyCode = {};

  // Pre-fetch unique surveys
  const surveyIds = getUniqueEntries(surveyResponses.map(sr => sr.survey_id));

  await models.wrapInReadOnlyTransaction(async transactingModels => {
    const surveys = await transactingModels.survey.findManyById(surveyIds);
    const surveyCodesById = reduceToDictionary(surveys, 'id', 'code');

    const entitiesUpserted = surveyResponses
      .filter(sr => !!sr.entities_upserted)
      .flatMap(sr => sr.entities_upserted);

    for (const response of surveyResponses) {
      const entityCode = await getEntityCodeFromSurveyResponseChange(
        transactingModels,
        response,
        entitiesUpserted,
      );
      const surveyCode = surveyCodesById[response.survey_id];
      (entitiesBySurveyCode[surveyCode] ??= []).push(entityCode);
    }
  });

  return assertCanImportSurveyResponses(accessPolicy, models, entitiesBySurveyCode);
};
