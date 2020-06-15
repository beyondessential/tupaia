/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import { TYPES } from '@tupaia/database';

export const findQuestionsBySurvey = async (
  models,
  criteria,
  options = {},
  findOrCount = 'find',
) => {
  const { survey_id: surveyId } = criteria;
  if (!surveyId) {
    return models.question[findOrCount](criteria, options);
  }
  const findOnlyOptions =
    findOrCount === 'find'
      ? {
          ...options,
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
          sort: ['screen_number', 'component_number'],
        }
      : {};
  return models.database[findOrCount](TYPES.QUESTION, criteria, {
    ...findOnlyOptions,
    multiJoin: [
      {
        joinWith: TYPES.SURVEY_SCREEN_COMPONENT,
        joinCondition: [`${TYPES.QUESTION}.id`, `${TYPES.SURVEY_SCREEN_COMPONENT}.question_id`],
      },
      {
        joinWith: TYPES.SURVEY_SCREEN,
        joinCondition: [`${TYPES.SURVEY_SCREEN}.id`, `${TYPES.SURVEY_SCREEN_COMPONENT}.screen_id`],
      },
    ],
  });
};
