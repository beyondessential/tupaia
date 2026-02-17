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
