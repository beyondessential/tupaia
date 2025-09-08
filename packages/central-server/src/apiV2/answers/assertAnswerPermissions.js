import { JOIN_TYPES, RECORDS } from '@tupaia/database';
import { ensure } from '@tupaia/tsutils';
import { mergeMultiJoin } from '../utilities';
import { assertSurveyResponsePermissions } from '../surveyResponses';

export const assertAnswerPermissions = async (accessPolicy, models, answerId) => {
  const answer = ensure(
    await models.answer.findById(answerId),
    `No answer exists with ID ${answerId}`,
  );
  return assertSurveyResponsePermissions(accessPolicy, models, answer.survey_response_id);
};

export const assertAnswerEditPermissions = async (
  accessPolicy,
  models,
  answerId,
  updatedFields,
) => {
  // Forbid editing the survey response id into a survey response we don't have permission to access
  if (updatedFields.survey_response_id) {
    const answer = ensure(
      await models.answer.findById(answerId),
      `No answer exists with ID ${answerId}`,
    );
    await assertSurveyResponsePermissions(accessPolicy, models, answer.survey_response_id);
  }
  return true;
};

export const createAnswerViaSurveyResponseDBFilter = async (
  criteria,
  options,
  surveyResponseId,
) => {
  // Filter by parent id
  const dbConditions = { ...criteria };
  dbConditions.survey_response_id = surveyResponseId;
  // Add additional sorting when requesting via parent
  const dbOptions = {
    ...options,
    // use the specified sort order first, so the the results get correctly sorted
    sort: [...options.sort, 'screen_number', 'component_number'],
  };

  // Join other tables necessary for the additional sorting entries
  dbOptions.multiJoin = mergeMultiJoin(
    [
      {
        joinWith: RECORDS.SURVEY_RESPONSE,
        joinCondition: [`${RECORDS.SURVEY_RESPONSE}.id`, `${RECORDS.ANSWER}.survey_response_id`],
      },
      {
        joinWith: RECORDS.ENTITY,
        joinCondition: [`${RECORDS.ENTITY}.id`, `${RECORDS.ANSWER}.text`],
        joinType: JOIN_TYPES.LEFT,
      },
      {
        joinWith: RECORDS.SURVEY_SCREEN,
        joinCondition: [
          `${RECORDS.SURVEY_SCREEN}.survey_id`,
          `${RECORDS.SURVEY_RESPONSE}.survey_id`,
        ],
      },
      {
        joinWith: RECORDS.SURVEY_SCREEN_COMPONENT,
        joinConditions: [
          [`${RECORDS.ANSWER}.question_id`, `${RECORDS.SURVEY_SCREEN_COMPONENT}.question_id`],
          [`${RECORDS.SURVEY_SCREEN}.id`, `${RECORDS.SURVEY_SCREEN_COMPONENT}.screen_id`],
        ],
      },
      {
        joinWith: RECORDS.USER_ACCOUNT,
        joinCondition: [`${RECORDS.USER_ACCOUNT}.id`, `${RECORDS.ANSWER}.text`],
        joinType: JOIN_TYPES.LEFT,
      },
    ],
    dbOptions.multiJoin,
  );

  return { dbConditions, dbOptions };
};
