import { allowNoPermissions } from '../permissions';

/**
 * Given a name returns a survey code
 *
 * Handles endpoints:
 * - /suggestSurveyCode
 */
export const suggestSurveyCode = async (req, res) => {
  const { models, query } = req;
  const { surveyName } = query;

  await req.assertPermissions(allowNoPermissions);

  const suggestedCode = await createSurveyCode(models, surveyName);

  res.status(200).type('json').send(JSON.stringify({ suggestedCode }));
};

const MAX_SURVEY_CODE_GENERATION_ATTEMPTS = 20;

const createSurveyCode = async (models, surveyName) => {
  const baseCode = surveyName
    .match(/\b(\w)/g)
    .join('')
    .toUpperCase();

  let code = baseCode;
  let attemptCount = 0;
  let otherSurveyWithSameCodeExists = false;
  do {
    attemptCount++;
    if (attemptCount > MAX_SURVEY_CODE_GENERATION_ATTEMPTS) {
      throw new Error('Maximum survey code generation attempts reached');
    }

    if (attemptCount > 1) {
      code = `${baseCode}${attemptCount}`;
    }

    otherSurveyWithSameCodeExists = !!(await models.survey.findOne({
      code,
    }));
  } while (otherSurveyWithSameCodeExists);

  return code;
};
