/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { generateTestId } from '@tupaia/database';

const portDouglas = {
  code: 'DL_1',
  name: 'Port Douglas',
  type: 'facility',
};

const kerang = {
  code: 'DL_2',
  name: 'Kerang',
  type: 'facility',
};
export const ENTITIES = [portDouglas, kerang];

const BCD1 = {
  id: generateTestId(),
  code: 'BCD1',
  text: 'Operational status',
  type: 'Radio',
};

const BCD325 = {
  id: generateTestId(),
  code: 'BCD325',
  text: 'Days of operation',
  type: 'Number',
};

const BCD_SURVEY = {
  id: generateTestId(),
  code: 'BCD',
  name: 'Basic Clinic Data',
  questions: [BCD1, BCD325],
};

const CROP_1 = {
  id: generateTestId(),
  code: 'CROP_1',
  text: 'How many potatoes were grown?',
  type: 'Number',
};
const CROP_2 = {
  id: generateTestId(),
  code: 'CROP_2',
  text: 'How many lettuces were grown?',
  type: 'Number',
};

const CROP_SURVEY = {
  id: generateTestId(),
  code: 'CROP',
  name: 'Crop productivity assessment',
  questions: [CROP_1, CROP_2],
};

export const SURVEYS = [BCD_SURVEY, CROP_SURVEY];

const BCD_RESPONSE_1 = {
  surveyCode: BCD_SURVEY.code,
  entityCode: portDouglas.code,
  submission_time: '2020-01-31T09:00:00',
  answers: [
    { questionCode: BCD1.code, text: 'Fully operational' },
    { questionCode: BCD325.code, text: '53' },
  ],
};

const BCD_RESPONSE_2 = {
  surveyCode: BCD_SURVEY.code,
  entityCode: kerang.code,
  submission_time: '2020-02-05T15:00:00',
  answers: [
    { questionCode: BCD1.code, text: 'Temporarily closed' },
    { questionCode: BCD325.code, text: '0' },
  ],
};

const CROP_RESPONSE_PORT_DOUGLAS_2019 = {
  surveyCode: CROP_SURVEY.code,
  entityCode: portDouglas.code,
  submission_time: '2019-11-21T09:00:00',
  answers: [
    { questionCode: CROP_1.code, text: '105' },
    { questionCode: CROP_2.code, text: '32' },
  ],
};

const CROP_RESPONSE_PORT_DOUGLAS_2020 = {
  surveyCode: CROP_SURVEY.code,
  entityCode: portDouglas.code,
  submission_time: '2020-11-21T09:00:00',
  answers: [{ questionCode: CROP_2.code, text: '55' }],
};

const CROP_RESPONSE_KERANG = {
  surveyCode: CROP_SURVEY.code,
  entityCode: kerang.code,
  submission_time: '2019-11-21T09:00:00',
  answers: [
    { questionCode: CROP_1.code, text: '5.1' },
    { questionCode: CROP_2.code, text: '55' },
  ],
};

export const SURVEY_RESPONSES = [
  BCD_RESPONSE_1,
  BCD_RESPONSE_2,
  CROP_RESPONSE_KERANG,
  CROP_RESPONSE_PORT_DOUGLAS_2019,
  CROP_RESPONSE_PORT_DOUGLAS_2020,
];
