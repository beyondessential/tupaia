import { ensure } from '@tupaia/tsutils';
import { PermissionsError } from '@tupaia/utils';

const assertSurveyEntityPairPermission = async (accessPolicy, models, surveyId, entityId) => {
  const [entity, permissionGroup] = await Promise.all([
    models.entity.findByIdOrThrow(entityId, { columns: ['country_code'] }),
    models.permissionGroup.findOneOrThrow(
      { [models.survey.fullyQualifyColumn('id')]: surveyId },
      {
        columns: [models.permissionGroup.fullyQualifyColumn('name')],
        joinWith: models.survey.databaseRecord,
        joinCondition: [models.permissionGroup.fullyQualifyColumn('id'), 'permission_group_id'],
      },
    ),
  ]);

  if (!accessPolicy.allows(entity.country_code, permissionGroup.name)) {
    throw new PermissionsError('You do not have permissions for this survey in this country');
  }

  return true;
};

export const assertSurveyResponsePermissions = async (accessPolicy, models, surveyResponseId) => {
  const surveyResponse = ensure(
    await models.surveyResponse.findById(surveyResponseId),
    `No survey response exists with ID ${surveyResponseId}`,
  );

  return assertSurveyEntityPairPermission(
    accessPolicy,
    models,
    surveyResponse.survey_id,
    surveyResponse.entity_id,
  );
};

export const assertSurveyResponseEditPermissions = async (
  accessPolicy,
  models,
  surveyResponseId,
  { survey_id, entity_id },
) => {
  // If we update survey_id or entity_id, check that we would still have permission for the result
  if (survey_id || entity_id) {
    const surveyResponse = await models.surveyResponse.findById(surveyResponseId);
    const surveyId = survey_id || surveyResponse.survey_id;
    const entityId = entity_id || surveyResponse.entity_id;

    await assertSurveyEntityPairPermission(accessPolicy, models, surveyId, entityId);
  }
  return true;
};
