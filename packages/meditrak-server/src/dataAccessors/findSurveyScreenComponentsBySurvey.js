/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import { TYPES } from '@tupaia/database';

export const findSurveyScreenComponentsBySurvey = async (
  models,
  criteria,
  options = {},
  findOrCount = 'find',
) => {
  const { survey_id: surveyId } = criteria;
  const columns = [
    { id: `${TYPES.SURVEY_SCREEN_COMPONENT}.id` },
    'code',
    'type',
    'indicator',
    'text',
    'detail',
    'options',
    'option_set_id',
    'visibility_criteria',
    'validation_criteria',
    'question_label',
    'detail_label',
    'config',
  ];
  const sort = ['component_number'];
  const multiJoin = [
    {
      joinWith: TYPES.QUESTION,
      joinCondition: [`${TYPES.QUESTION}.id`, `${TYPES.SURVEY_SCREEN_COMPONENT}.question_id`],
    },
  ];

  if (surveyId) {
    columns.push('screen_number');
    sort.unshift('screen_number');
    multiJoin.push({
      joinWith: TYPES.SURVEY_SCREEN,
      joinCondition: [`${TYPES.SURVEY_SCREEN}.id`, `${TYPES.SURVEY_SCREEN_COMPONENT}.screen_id`],
    });
  }
  const findOnlyOptions =
    findOrCount === 'find'
      ? {
          ...options,
          columns,
          sort,
        }
      : {};

  return models.database[findOrCount](TYPES.SURVEY_SCREEN_COMPONENT, criteria, {
    ...findOnlyOptions,
    multiJoin,
  });
};
