/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

// answers table
const ANSWER = [
  {
    id: 'answer001_test',
    text: '1',
    survey_response_id: 'surveyResponse001_test',
    question_id: 'question001_test',
  },
  {
    id: 'answer002_test',
    text: '2',
    survey_response_id: 'surveyResponse001_test',
    question_id: 'question002_test',
  },
  {
    id: 'answer003_test',
    text: '3',
    survey_response_id: 'surveyResponse002_test',
    question_id: 'question001_test',
  },
  {
    id: 'answer004_test',
    text: '4',
    survey_response_id: 'surveyResponse002_test',
    question_id: 'question002_test',
  },
  {
    id: 'answer005_test',
    text: '5',
    survey_response_id: 'surveyResponse003_test',
    question_id: 'question001_test',
  },
  {
    id: 'answer006_test',
    text: '6',
    survey_response_id: 'surveyResponse003_test',
    question_id: 'question002_test',
  },
  {
    id: 'answer007_test',
    text: '7',
    survey_response_id: 'surveyResponse004_test',
    question_id: 'question003_test',
  },
  {
    id: 'answer008_test',
    text: '8',
    survey_response_id: 'surveyResponse004_test',
    question_id: 'question004_test',
  },
  {
    id: 'answer009_test',
    text: '9',
    survey_response_id: 'surveyResponse005_test',
    question_id: 'question003_test',
  },
  {
    id: 'answer010_test',
    text: '10',
    survey_response_id: 'surveyResponse005_test',
    question_id: 'question004_test',
  },
];

const USER = [
  {
    id: 'user001_test',
    name: 'Test User',
    email: 'testuser@tupaia.org',
    password_hash: 'hash',
    password_salt: 'salt',
  },
];

const SURVEY_RESPONSE = [
  {
    id: 'surveyResponse001_test',
    end_time: '2020-01-01 11:58:23',
    survey_id: 'survey001_test',
    entity_id: 'entity001_test',
    user_id: 'user001_test',
  },
  {
    id: 'surveyResponse002_test',
    end_time: '2020-01-01 11:58:23',
    survey_id: 'survey001_test',
    entity_id: 'entity002_test',
    user_id: 'user001_test',
  },
  {
    id: 'surveyResponse003_test',
    end_time: '2020-01-01 11:58:23',
    survey_id: 'survey001_test',
    entity_id: 'entity001_test',
    user_id: 'user001_test',
  },
  {
    id: 'surveyResponse004_test',
    end_time: '2020-01-01 11:58:23',
    survey_id: 'survey002_test',
    entity_id: 'entity001_test',
    user_id: 'user001_test',
  },
  {
    id: 'surveyResponse005_test',
    end_time: '2020-01-01 11:58:23',
    survey_id: 'survey002_test',
    entity_id: 'entity002_test',
    user_id: 'user001_test',
  },
];

const SURVEY = [
  { id: 'survey001_test', code: 'S001', data_source_id: 'dataSource005_test' },
  { id: 'survey002_test', code: 'S002', data_source_id: 'dataSource006_test' },
];

const ENTITY = [
  { id: 'entity001_test', code: 'E001', name: 'Happy Land' },
  { id: 'entity002_test', code: 'E002', name: 'Sad Land' },
];

const QUESTION = [
  { id: 'question001_test', code: 'Q001', type: 'Number', data_source_id: 'dataSource001_test' },
  { id: 'question002_test', code: 'Q002', type: 'Number', data_source_id: 'dataSource002_test' },
  { id: 'question003_test', code: 'Q003', type: 'Number', data_source_id: 'dataSource003_test' },
  { id: 'question004_test', code: 'Q004', type: 'Number', data_source_id: 'dataSource004_test' },
];

const DATA_SOURCE = [
  { id: 'dataSource001_test', type: 'dataElement', service_type: 'tupaia' },
  { id: 'dataSource002_test', type: 'dataElement', service_type: 'tupaia' },
  { id: 'dataSource003_test', type: 'dataElement', service_type: 'tupaia' },
  { id: 'dataSource004_test', type: 'dataElement', service_type: 'tupaia' },
  { id: 'dataSource005_test', type: 'dataGroup', service_type: 'tupaia' },
  { id: 'dataSource006_test', type: 'dataGroup', service_type: 'tupaia' },
];

export const TEST_DATA = {
  entity: ENTITY,
  user: USER,
  dataSource: DATA_SOURCE,
  survey: SURVEY,
  question: QUESTION,
  surveyResponse: SURVEY_RESPONSE,
  answer: ANSWER,
};

export const ANSWER001_TEST_ANALYTIC = {
  value: '1',
  type: 'Number',
  entity_code: 'E001',
  entity_name: 'Happy Land',
  data_element_code: 'Q001',
  data_group_code: 'S001',
  event_id: 'surveyResponse001_test',
  year_period: '2020-01-01 00:00:00',
  month_period: '2020-01-01 00:00:00',
  week_period: '2020-01-01 00:00:00',
  day_period: '2020-01-01 00:00:00',
  date: '2020-01-01 11:58:23',
};

export const ANALYTICS = [
  ANSWER001_TEST_ANALYTIC,
  {
    value: '2',
    type: 'Number',
    entity_code: 'E001',
    entity_name: 'Happy Land',
    data_element_code: 'Q002',
    data_group_code: 'S001',
    event_id: 'surveyResponse001_test',
    year_period: '2020-01-01 00:00:00',
    month_period: '2020-01-01 00:00:00',
    week_period: '2020-01-01 00:00:00',
    day_period: '2020-01-01 00:00:00',
    date: '2020-01-01 11:58:23',
  },
  {
    value: '3',
    type: 'Number',
    entity_code: 'E002',
    entity_name: 'Sad Land',
    data_element_code: 'Q001',
    data_group_code: 'S001',
    event_id: 'surveyResponse002_test',
    year_period: '2020-01-01 00:00:00',
    month_period: '2020-01-01 00:00:00',
    week_period: '2020-01-01 00:00:00',
    day_period: '2020-01-01 00:00:00',
    date: '2020-01-01 11:58:23',
  },
  {
    value: '4',
    type: 'Number',
    entity_code: 'E002',
    entity_name: 'Sad Land',
    data_element_code: 'Q002',
    data_group_code: 'S001',
    event_id: 'surveyResponse002_test',
    year_period: '2020-01-01 00:00:00',
    month_period: '2020-01-01 00:00:00',
    week_period: '2020-01-01 00:00:00',
    day_period: '2020-01-01 00:00:00',
    date: '2020-01-01 11:58:23',
  },
  {
    value: '5',
    type: 'Number',
    entity_code: 'E001',
    entity_name: 'Happy Land',
    data_element_code: 'Q001',
    data_group_code: 'S001',
    event_id: 'surveyResponse003_test',
    year_period: '2020-01-01 00:00:00',
    month_period: '2020-01-01 00:00:00',
    week_period: '2020-01-01 00:00:00',
    day_period: '2020-01-01 00:00:00',
    date: '2020-01-01 11:58:23',
  },
  {
    value: '6',
    type: 'Number',
    entity_code: 'E001',
    entity_name: 'Happy Land',
    data_element_code: 'Q002',
    data_group_code: 'S001',
    event_id: 'surveyResponse003_test',
    year_period: '2020-01-01 00:00:00',
    month_period: '2020-01-01 00:00:00',
    week_period: '2020-01-01 00:00:00',
    day_period: '2020-01-01 00:00:00',
    date: '2020-01-01 11:58:23',
  },
  {
    value: '7',
    type: 'Number',
    entity_code: 'E001',
    entity_name: 'Happy Land',
    data_element_code: 'Q003',
    data_group_code: 'S002',
    event_id: 'surveyResponse004_test',
    year_period: '2020-01-01 00:00:00',
    month_period: '2020-01-01 00:00:00',
    week_period: '2020-01-01 00:00:00',
    day_period: '2020-01-01 00:00:00',
    date: '2020-01-01 11:58:23',
  },
  {
    value: '8',
    type: 'Number',
    entity_code: 'E001',
    entity_name: 'Happy Land',
    data_element_code: 'Q004',
    data_group_code: 'S002',
    event_id: 'surveyResponse004_test',
    year_period: '2020-01-01 00:00:00',
    month_period: '2020-01-01 00:00:00',
    week_period: '2020-01-01 00:00:00',
    day_period: '2020-01-01 00:00:00',
    date: '2020-01-01 11:58:23',
  },
  {
    value: '9',
    type: 'Number',
    entity_code: 'E002',
    entity_name: 'Sad Land',
    data_element_code: 'Q003',
    data_group_code: 'S002',
    event_id: 'surveyResponse005_test',
    year_period: '2020-01-01 00:00:00',
    month_period: '2020-01-01 00:00:00',
    week_period: '2020-01-01 00:00:00',
    day_period: '2020-01-01 00:00:00',
    date: '2020-01-01 11:58:23',
  },
  {
    value: '10',
    type: 'Number',
    entity_code: 'E002',
    entity_name: 'Sad Land',
    data_element_code: 'Q004',
    data_group_code: 'S002',
    event_id: 'surveyResponse005_test',
    year_period: '2020-01-01 00:00:00',
    month_period: '2020-01-01 00:00:00',
    week_period: '2020-01-01 00:00:00',
    day_period: '2020-01-01 00:00:00',
    date: '2020-01-01 11:58:23',
  },
];
