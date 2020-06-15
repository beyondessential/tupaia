/**
 * Tupaia Config Server
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 **/
import { TYPES } from '@tupaia/database';
import { BaseModel } from './BaseModel';

export class Question extends BaseModel {
  static databaseType = TYPES.QUESTION;

  static fields = [
    'id',
    'text',
    'name',
    'image_data',
    'type',
    'options',
    'code',
    'detail',
    'option_set_id',
    'hook',
  ];

  static async findQuestionsBySurvey(criteria, options = {}) {
    const findOptions = {
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
    };

    return Question.database.find(TYPES.QUESTION, criteria, {
      ...findOptions,
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
    });
  }
}
