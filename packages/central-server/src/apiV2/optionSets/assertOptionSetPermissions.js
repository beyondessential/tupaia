import { assertSurveyEditPermissions } from '../surveys';

export const assertOptionSetEditPermissions = async (accessPolicy, models, optionSetId) => {
  const optionSet = await models.optionSet.findById(optionSetId);
  if (!optionSet) {
    throw new Error(`No optionSet exists with id ${optionSetId}`);
  }

  const surveyIds = await optionSet.getSurveyIds();
  for (let i = 0; i < surveyIds.length; ++i) {
    await assertSurveyEditPermissions(
      accessPolicy,
      models,
      surveyIds[i],
      'Requires permission to all surveys the optionSet appears in',
    );
  }

  return true;
};
