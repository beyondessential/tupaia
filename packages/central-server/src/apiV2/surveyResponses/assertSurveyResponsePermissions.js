import { assertIsNotNullish, ensure } from '@tupaia/tsutils';
import { PermissionsError } from '@tupaia/utils';

const assertSurveyEntityPairPermission = async (accessPolicy, models, surveyId, entityId) => {
  const [entity, survey] = await Promise.all([
    models.entity.findById(entityId),
    models.survey.findById(surveyId),
  ]);
  assertIsNotNullish(entity, `No entity exists with ID ${entityId}`);
  assertIsNotNullish(survey, `No survey exists with ID ${surveyId}`);

  const permissionGroup = await survey.getPermissionGroup();
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
