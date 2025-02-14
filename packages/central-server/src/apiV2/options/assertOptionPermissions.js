import { assertSurveyEditPermissions } from '../surveys';

export const assertOptionEditPermissions = async (accessPolicy, models, optionId) => {
  const option = await models.option.findById(optionId);
  if (!option) {
    throw new Error(`No option exists with id ${optionId}`);
  }

  const surveyIds = await option.getSurveyIds();
  for (let i = 0; i < surveyIds.length; ++i) {
    await assertSurveyEditPermissions(
      accessPolicy,
      models,
      surveyIds[i],
      'Requires permission to all surveys the option appears in',
    );
  }

  return true;
};
