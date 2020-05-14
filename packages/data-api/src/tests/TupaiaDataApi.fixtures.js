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

export const BCD_EVENT_AUCKLAND = {
  event: BCD_RESPONSE_AUCKLAND.id,
  orgUnit: auckland.code,
  orgUnitName: auckland.name,
  eventDate: '2020-01-31T09:00:00',
  dataValues: {
    [BCD1.code]: 'Fully operational',
    [BCD325.code]: '53',
  },
};

export const BCD_EVENT_WELLINGTON = {
  event: BCD_RESPONSE_WELLINGTON.id,
  orgUnit: wellington.code,
  orgUnitName: wellington.name,
  eventDate: '2020-02-05T15:00:00',
  dataValues: {
    [BCD1.code]: 'Temporarily closed',
    [BCD325.code]: '0',
  },
};

export const CROP_EVENT_AUCKLAND_2019 = {
  event: CROP_RESPONSE_AUCKLAND_2019.id,
  orgUnit: auckland.code,
  orgUnitName: auckland.name,
  eventDate: '2019-11-21T09:00:00',
  dataValues: {
    [CROP_1.code]: '105',
    [CROP_2.code]: '32',
  },
};

export const CROP_EVENT_AUCKLAND_2020 = {
  event: CROP_RESPONSE_AUCKLAND_2020.id,
  orgUnit: auckland.code,
  orgUnitName: auckland.name,
  eventDate: '2020-11-21T09:00:00',
  dataValues: { [CROP_2.code]: '55' },
};

export const CROP_EVENT_WELLINGTON = {
  event: CROP_RESPONSE_WELLINGTON.id,
  orgUnit: wellington.code,
  orgUnitName: wellington.name,
  eventDate: '2019-11-21T09:00:00',
  dataValues: {
    [CROP_1.code]: '5.1',
    [CROP_2.code]: '55',
  },
};

export const SURVEY_RESPONSES = [
  BCD_RESPONSE_AUCKLAND,
  BCD_RESPONSE_WELLINGTON,
  CROP_RESPONSE_WELLINGTON,
  CROP_RESPONSE_AUCKLAND_2019,
  CROP_RESPONSE_AUCKLAND_2020,
];
