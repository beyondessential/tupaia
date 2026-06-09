/**
 * @typedef {import('@tupaia/access-policy').AccessPolicy}
 * @typedef {import('@tupaia/types').Entity} Entity
 * @typedef {import('@tupaia/types').Survey} Survey
 * @typedef {import('@tupaia/types').SurveyResponse} SurveyResponse
 * @typedef {import('../../ModelRegistry').ModelRegistry} ModelRegistry
 * @typedef {import('../../modelClasses/Entity').EntityRecord} EntityRecord
 * @typedef {import('../../modelClasses/PermissionGroup').PermissionGroupRecord} PermissionGroupRecord
 * @typedef {import('../../modelClasses/Survey/Survey').Survey} Survey
 */

import { PermissionsError } from '@tupaia/utils';

/**
 * @param {AccessPolicy} accessPolicy
 * @param {ModelRegistry} transactingModels
 * @param {Survey['id']} surveyId
 * @param {Entity['id']} entityId
 * @returns {Promise<true>}
 * @throws {PermissionsError}
 */
const assertSurveyEntityPairPermission = async (
  accessPolicy,
  transactingModels,
  surveyId,
  entityId,
) => {
  /** @type {[EntityRecord, PermissionGroupRecord]} */
  const [entity, permissionGroup] = await Promise.all([
    transactingModels.entity.findByIdOrThrow(entityId, { columns: ['country_code'] }),
    transactingModels.permissionGroup.findOneOrThrow(
      { [transactingModels.survey.fullyQualifyColumn('id')]: surveyId },
      {
        columns: [transactingModels.permissionGroup.fullyQualifyColumn('name')],
        joinWith: transactingModels.survey.databaseRecord,
        joinCondition: [
          transactingModels.permissionGroup.fullyQualifyColumn('id'),
          'permission_group_id',
        ],
      },
    ),
  ]);

  if (!accessPolicy.allows(entity.country_code, permissionGroup.name)) {
    throw new PermissionsError('You do not have permissions for this survey in this country');
  }

  return true;
};

/**
 * @param {ModelRegistry} transactingModels
 * @param {AccessPolicy} accessPolicy
 * @param {SurveyResponse['id']} surveyResponseId
 * @returns {Promise<true>}
 * @throws {PermissionsError}
 */
export const assertSurveyResponsePermissions = async (
  transactingModels,
  accessPolicy,
  surveyResponseId,
) => {
  const surveyResponse = await transactingModels.surveyResponse.findByIdOrThrow(surveyResponseId, {
    columns: ['entity_id', 'survey_id'],
  });
  return await assertSurveyEntityPairPermission(
    accessPolicy,
    transactingModels,
    surveyResponse.survey_id,
    surveyResponse.entity_id,
  );
};
