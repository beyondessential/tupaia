/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { generateTestId } from '@tupaia/database';

const auckland = {
  code: 'NZ_AK',
  name: 'Auckland',
  type: 'district',
};

const wellington = {
  code: 'NZ_WG',
  name: 'Wellington',
  type: 'district',
};
export const ENTITIES = [auckland, wellington];

const BCD1 = {
  code: 'BCD1',
  indicator: 'Facility Status',
  type: 'Radio',
};

const BCD325 = {
  code: 'BCD325',
  indicator: 'Days of operation',
  type: 'Number',
};

const BCD_SURVEY = {
  code: 'BCD',
  name: 'Basic Clinic Data',
  questions: [BCD1, BCD325],
};

const CROP_1 = {
  code: 'CROP_1',
  indicator: 'Number of potatoes grown',
  type: 'Number',
};
const CROP_2 = {
  code: 'CROP_2',
  indicator: 'Number of lettuces grown',
  type: 'Number',
};

const CROP_SURVEY = {
  code: 'CROP',
  name: 'Crop productivity assessment',
  questions: [CROP_1, CROP_2],
};

export const SURVEYS = [BCD_SURVEY, CROP_SURVEY];

export const BCD_RESPONSE_AUCKLAND = {
  id: generateTestId(),
  surveyCode: BCD_SURVEY.code,
  entityCode: auckland.code,
  submission_time: '2020-01-31T09:00:00Z',
  answers: [
    { questionCode: BCD1.code, text: 'Fully operational' },
    { questionCode: BCD325.code, text: '53' },
  ],
};

export const BCD_RESPONSE_WELLINGTON = {
  id: generateTestId(),
  surveyCode: BCD_SURVEY.code,
  entityCode: wellington.code,
  submission_time: '2020-02-05T15:00:00Z',
  answers: [
    { questionCode: BCD1.code, text: 'Temporarily closed' },
    { questionCode: BCD325.code, text: '0' },
  ],
};

export const CROP_RESPONSE_AUCKLAND_2019 = {
  id: generateTestId(),
  surveyCode: CROP_SURVEY.code,
  entityCode: auckland.code,
  submission_time: '2019-11-21T09:00:00Z',
  answers: [
    { questionCode: CROP_1.code, text: '105' },
    { questionCode: CROP_2.code, text: '32' },
  ],
};

export const CROP_RESPONSE_AUCKLAND_2020 = {
  id: generateTestId(),
  surveyCode: CROP_SURVEY.code,
  entityCode: auckland.code,
  submission_time: '2020-11-21T09:00:00Z',
  answers: [{ questionCode: CROP_2.code, text: '55' }],
};

export const CROP_RESPONSE_WELLINGTON = {
  id: generateTestId(),
  surveyCode: CROP_SURVEY.code,
  entityCode: wellington.code,
  submission_time: '2019-11-21T09:00:00Z',
  answers: [
    { questionCode: CROP_1.code, text: '5.1' },
    { questionCode: CROP_2.code, text: '55' },
  ],
};

export const SURVEY_RESPONSES = [
  BCD_RESPONSE_AUCKLAND,
  BCD_RESPONSE_WELLINGTON,
  CROP_RESPONSE_WELLINGTON,
  CROP_RESPONSE_AUCKLAND_2019,
  CROP_RESPONSE_AUCKLAND_2020,
];
