/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import { TYPES } from '@tupaia/database';

export const findSurveyScreenComponentsInSurvey = async (
  models,
  surveyId,
  criteria,
  options = {},
  findOrCount = 'find',
) => {
  const columns = [
    { id: `${TYPES.SURVEY_SCREEN_COMPONENT}.id` },
    'code',
    'type',
    'name',
    'text',
    'detail',
    'options',
    'option_set_id',
    'visibility_criteria',
    'validation_criteria',
    'question_label',
    'detail_label',
    'config',
    'screen_number',
  ];
  const sort = ['screen_number', 'component_number'];
  const multiJoin = [
    {
      joinWith: TYPES.QUESTION,
      joinCondition: [`${TYPES.QUESTION}.id`, `${TYPES.SURVEY_SCREEN_COMPONENT}.question_id`],
    },
    {
      joinWith: TYPES.SURVEY_SCREEN,
      joinCondition: [`${TYPES.SURVEY_SCREEN}.id`, `${TYPES.SURVEY_SCREEN_COMPONENT}.screen_id`],
    },
  ];

  const findOnlyOptions =
    findOrCount === 'find'
      ? {
          ...options,
          columns,
          sort,
        }
      : {};

  return models.database[findOrCount](
    TYPES.SURVEY_SCREEN_COMPONENT,
    { ...criteria, survey_id: surveyId },
    {
      ...findOnlyOptions,
      multiJoin,
    },
  );
};
