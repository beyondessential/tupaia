import { RECORDS, generateId } from '@tupaia/database';
import { ANSWER_TYPES } from '../../../../../database/models/Answer';

export const DHIS_REFERENCE = 'XXXXXXX';

const USER = {
  id: generateId(),
  first_name: 'John',
  last_name: 'Smith',
};

const ENTITY = {
  id: generateId(),
  code: 'entity_1',
};

export const SURVEY = {
  id: generateId(),
  code: 'ABC',
  can_repeat: true,
  questions: [QUESTION],
};

export const QUESTION = {
  id: generateId(),
  code: 'question_1',
  type: ANSWER_TYPES.NUMBER,
};

export const SURVEY_RESPONSE = {
  id: generateId(),
  entity_id: ENTITY.id,
  data_time: '2019-05-20T13:05',
  survey_id: SURVEY.id,
  user_id: USER.id,
};

export const ANSWER = {
  id: generateId(),
  type: QUESTION.type,
  survey_response_id: SURVEY_RESPONSE.id,
  question_id: QUESTION.id,
  text: '2',
};

export const CHANGE = {
  id: SURVEY_RESPONSE.id, // to ensure upsert works when generating test data
  type: 'update',
  record_type: RECORDS.SURVEY_RESPONSE,
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
