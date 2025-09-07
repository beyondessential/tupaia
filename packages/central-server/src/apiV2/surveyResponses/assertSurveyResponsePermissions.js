const assertSurveyEntityPairPermission = async (accessPolicy, models, surveyId, entityId) => {
  const entity = await models.entity.findById(entityId);
  const survey = await models.survey.findById(surveyId);
  const permissionGroup = await models.permissionGroup.findById(survey.permission_group_id);

  if (!accessPolicy.allows(entity.country_code, permissionGroup.name)) {
    throw new Error('You do not have permissions for this survey in this country');
  }
  return true;
};

export const assertSurveyResponsePermissions = async (accessPolicy, models, surveyResponseId) => {
  const surveyResponse = await models.surveyResponse.findById(surveyResponseId);
  if (!surveyResponse) {
    throw new Error(`No survey response exists with id ${surveyResponseId}`);
  }

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
