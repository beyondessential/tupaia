/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import { TYPES } from '@tupaia/database';

export const findQuestionsInSurvey = async (models, surveyId) => {
  return models.database.find(
    TYPES.QUESTION,
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
      ],
      multiJoin: [
        {
          joinWith: TYPES.SURVEY_SCREEN_COMPONENT,
          joinCondition: [`${TYPES.QUESTION}.id`, `${TYPES.SURVEY_SCREEN_COMPONENT}.question_id`],
        },
        {
          joinWith: TYPES.SURVEY_SCREEN,
          joinCondition: [
            `${TYPES.SURVEY_SCREEN}.id`,
            `${TYPES.SURVEY_SCREEN_COMPONENT}.screen_id`,
          ],
        },
      ],
      sort: ['screen_number', 'component_number'],
    },
  );
};
