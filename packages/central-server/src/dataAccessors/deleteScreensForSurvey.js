/**
 * Delete all screens and screen components for the given survey id
 */
export async function deleteScreensForSurvey(models, surveyId) {
  await models.surveyScreen.delete({ survey_id: surveyId }); // Will CASCADE to components
}
