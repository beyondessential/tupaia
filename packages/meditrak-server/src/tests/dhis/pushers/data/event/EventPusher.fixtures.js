/**
 * Tupaia MediTrak
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { TYPES, generateTestId } from '@tupaia/database';
import { ANSWER_TYPES } from '../../../../../database/models/Answer';

export const DHIS_REFERENCE = 'XXXXXXX';

const USER = {
  id: generateTestId(),
  first_name: 'John',
  last_name: 'Smith',
};

const ENTITY = {
  id: generateTestId(),
  code: 'entity_1',
};

export const SURVEY = {
  id: generateTestId(),
  code: 'ABC',
  can_repeat: true,
  questions: [QUESTION],
};

export const QUESTION = {
  id: generateTestId(),
  code: 'question_1',
  type: ANSWER_TYPES.NUMBER,
};

export const SURVEY_RESPONSE = {
  id: generateTestId(),
  entity_id: ENTITY.id,
  data_time: '2019-05-20T13:05',
  survey_id: SURVEY.id,
  user_id: USER.id,
};

export const ANSWER = {
  id: generateTestId(),
  type: QUESTION.type,
  survey_response_id: SURVEY_RESPONSE.id,
  question_id: QUESTION.id,
  text: '2',
};

export const CHANGE = {
  id: SURVEY_RESPONSE.id, // to ensure upsert works when generating test data
  type: 'update',
  record_type: TYPES.SURVEY_RESPONSE,
  record_id: SURVEY_RESPONSE.id,
};

export const BASELINE_TEST_DATA = {
  user: [USER],
  entity: [ENTITY],
  surveyResponse: [SURVEY_RESPONSE],
  answer: [ANSWER],
  dhisSyncQueue: [CHANGE],
};

export const SERVER_NAME = 'test server';

export const DATA_SOURCE_TYPE = 'test data source type';
