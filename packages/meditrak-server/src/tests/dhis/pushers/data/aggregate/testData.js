/**
 * Tupaia MediTrak
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */
import moment from 'moment';
import { TYPES } from '@tupaia/database';
import { generateTestId } from '../../../../testUtilities';
import { ANSWER_TYPES } from '../../../../../database/models/Answer';

export const ORGANISATION_UNIT_ID = 'org_unit_xxx';
export const DATA_SET = { id: 'xxxx', periodType: 'Daily' };
export const DAILY_DATA_SET = { ...DATA_SET, periodType: 'Daily' };
export const WEEKLY_DATA_SET = { ...DATA_SET, periodType: 'Weekly' };
export const MONTHLY_DATA_SET = { ...DATA_SET, periodType: 'Monthly' };
export const YEARLY_DATA_SET = { ...DATA_SET, periodType: 'Yearly' };

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
};

export const QUESTION = {
  id: generateTestId(),
  code: 'question_1',
  type: ANSWER_TYPES.NUMBER,
};

export const SURVEY_RESPONSE = {
  id: generateTestId(),
  entity_id: ENTITY.id,
  submission_time: '2019-05-20T10:05:00.000Z',
  end_time: '2019-04-10T10:05:00.000Z',
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

export const ANSWER_CHANGE = {
  id: ANSWER.id, // to ensure upsert works when generating test data
  type: 'update',
  record_type: TYPES.ANSWER,
  record_id: ANSWER.id,
};

export const SURVEY_RESPONSE_CHANGE = {
  id: SURVEY_RESPONSE.id, // to ensure upsert works when generating test data
  type: 'update',
  record_type: TYPES.SURVEY_RESPONSE,
  record_id: SURVEY_RESPONSE.id,
};

export const BASELINE_TEST_DATA = {
  user: [USER],
  entity: [ENTITY],
  surveyResponse: [SURVEY_RESPONSE],
  question: [QUESTION],
  answer: [ANSWER],
  dhisSyncQueue: [ANSWER_CHANGE, SURVEY_RESPONSE_CHANGE],
};

const PERIOD = moment(SURVEY_RESPONSE.submission_time).format('YYYYMMDD');
const STORED_BY = `${USER.first_name} ${USER.last_name}`;

export const ANSWER_DATA_VALUE_DIMENSIONS = {
  code: QUESTION.code,
  orgUnit: ENTITY.code,
  period: PERIOD,
};
export const ANSWER_DATA_VALUE = {
  ...ANSWER_DATA_VALUE_DIMENSIONS,
  value: ANSWER.text,
  storedBy: STORED_BY,
};
export const ANSWER_SYNC_LOG_DATA = {
  ...ANSWER_DATA_VALUE,
  entityId: ENTITY.id,
  surveyId: SURVEY.id,
  questionId: QUESTION.id,
};
export const SURVEY_RESPONSE_DATA_VALUE_DIMENSIONS = {
  ...ANSWER_DATA_VALUE_DIMENSIONS,
  code: `${SURVEY.code}SurveyDate`,
};
export const SURVEY_RESPONSE_DATA_VALUE = {
  ...ANSWER_DATA_VALUE,
  ...SURVEY_RESPONSE_DATA_VALUE_DIMENSIONS,
  value: moment(SURVEY_RESPONSE.submission_time).format('YYYY-MM-DD'),
};
export const SURVEY_RESPONSE_SYNC_LOG_DATA = {
  ...ANSWER_SYNC_LOG_DATA,
  ...SURVEY_RESPONSE_DATA_VALUE,
};
export const DATA_SET_COMPLETION_DIMENSIONS = {
  period: PERIOD,
  dataSet: DATA_SET.id,
  organisationUnit: ORGANISATION_UNIT_ID,
};
export const DATA_SET_COMPLETION = {
  ...DATA_SET_COMPLETION_DIMENSIONS,
  date: moment.utc(SURVEY_RESPONSE.end_time).format('YYYY-MM-DDTkk:mm:ss'),
  storedBy: STORED_BY,
};
export const SERVER_NAME = 'test server name';
export const getSyncLog = change => ({
  id: change.record_id,
  record_id: change.record_id,
  imported: 1,
  updated: 0,
  deleted: 0,
  ignored: 0,
  data:
    change.record_type === 'answer'
      ? { ...ANSWER_SYNC_LOG_DATA, serverName: SERVER_NAME }
      : { ...SURVEY_RESPONSE_SYNC_LOG_DATA, serverName: SERVER_NAME },
});
export const getFailedSyncLog = change => ({
  id: change.record_id,
  record_id: change.record_id,
  imported: 0,
  updated: 0,
  deleted: 0,
  ignored: 1,
  data: null,
});
