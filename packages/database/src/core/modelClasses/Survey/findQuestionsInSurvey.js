import { RECORDS } from '../../records';

export const findQuestionsInSurvey = async (models, surveyId) => {
  return await models.database.find(
    RECORDS.QUESTION,
    { survey_id: surveyId },
    {
      columns: [
        { id: 'question_id' },
        'code',
        'type',
        'name',
        'text',
        'detail',
        'options',
        'option_set_id',
        'screen_number',
        'visibility_criteria',
        'validation_criteria',
        'question_label',
        'detail_label',
        'config',
        'hook',
      ],
      multiJoin: [
        {
          joinWith: RECORDS.SURVEY_SCREEN_COMPONENT,
          joinCondition: [
            `${RECORDS.QUESTION}.id`,
            `${RECORDS.SURVEY_SCREEN_COMPONENT}.question_id`,
          ],
        },
        {
          joinWith: RECORDS.SURVEY_SCREEN,
          joinCondition: [
            `${RECORDS.SURVEY_SCREEN}.id`,
            `${RECORDS.SURVEY_SCREEN_COMPONENT}.screen_id`,
          ],
        },
      ],
      sort: ['screen_number', 'component_number'],
    },
  );
};
