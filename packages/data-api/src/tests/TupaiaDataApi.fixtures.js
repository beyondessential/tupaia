/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { generateTestId } from '@tupaia/database';

const portDouglas = {
  id: generateTestId(),
  code: 'DL_1',
  name: 'Port Douglas',
  type: 'facility',
};

const kerang = {
  id: generateTestId(),
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

export const BCD_RESPONSE_1 = {
  survey_id: BCD_SURVEY,
  entity_id: portDouglas.id,
  submission_time: '2020-01-31T09:00:00',
  answers: [
    { question_id: BCD1.id, text: 'Fully operational' },
    { question_id: BCD325.id, text: '53' },
  ],
};

export const BCD_RESPONSE_2 = {
  survey_id: BCD_SURVEY,
  entity_id: kerang.id,
  submission_time: '2020-02-05T15:00:00',
  answers: [
    { question_id: BCD1.id, text: 'Temporarily closed' },
    { question_id: BCD325.id, text: '0' },
  ],
};

export const CROP_RESPONSE_PORT_DOUGLAS_2019 = {
  survey_id: CROP_SURVEY,
  entity_id: portDouglas.id,
  submission_time: '2019-11-21T09:00:00',
  answers: [
    { question_id: CROP_1.id, text: '105' },
    { question_id: CROP_2.id, text: '32' },
  ],
};

export const CROP_RESPONSE_PORT_DOUGLAS_2020 = {
  survey_id: CROP_SURVEY,
  entity_id: portDouglas.id,
  submission_time: '2020-11-21T09:00:00',
  answers: [{ question_id: CROP_2.id, text: '55' }],
};

export const CROP_RESPONSE_KERANG = {
  survey_id: CROP_SURVEY,
  entity_id: kerang.id,
  submission_time: '2019-11-21T09:00:00',
  answers: [
    { question_id: CROP_1.id, text: '5.1' },
    { question_id: CROP_2.id, text: '55' },
  ],
};
