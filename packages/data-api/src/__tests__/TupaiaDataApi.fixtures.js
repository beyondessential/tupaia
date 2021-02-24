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
  name: 'Facility Status',
  type: 'Radio',
  options: [],
};

const BCD325 = {
  code: 'BCD325',
  name: 'Days of operation',
  type: 'Number',
  options: [],
};

const BCD57 = {
  code: 'BCD57',
  name: 'Foundation',
  type: 'Radio',
  options: [
    'Concrete slab',
    'Concrete stumps',
    'Timber stumps',
    'Timber on ground',
    'Earth',
    'Other',
  ],
};

const BCD_SURVEY = {
  code: 'BCD',
  name: 'Basic Clinic Data',
  questions: [BCD1, BCD325, BCD57],
};

const CROP_1 = {
  code: 'CROP_1',
  name: 'Number of potatoes grown',
  type: 'Number',
  options: [],
};
const CROP_2 = {
  code: 'CROP_2',
  name: 'Number of lettuces grown',
  type: 'Number',
  options: [],
};

const CROP_SURVEY = {
  code: 'CROP',
  name: 'Crop productivity assessment',
  questions: [CROP_1, CROP_2],
};

export const SURVEYS = [BCD_SURVEY, CROP_SURVEY];

export const BCD_RESPONSE_AUCKLAND = {
  id: generateTestId(),
  surveyCode: 'BCD',
  entityCode: auckland.code,
  submission_time: '2020-01-31T09:00:00Z',
  answers: {
    BCD1: 'Fully operational',
    BCD325: '53',
  },
};

export const BCD_RESPONSE_WELLINGTON = {
  id: generateTestId(),
  surveyCode: 'BCD',
  entityCode: wellington.code,
  submission_time: '2020-02-05T15:00:00Z',
  answers: {
    BCD1: 'Temporarily closed',
    BCD325: '0',
  },
};

export const CROP_RESPONSE_AUCKLAND_2019 = {
  id: generateTestId(),
  surveyCode: 'CROP',
  entityCode: auckland.code,
  submission_time: '2019-11-21T09:00:00Z',
  answers: {
    CROP_1: '105',
    CROP_2: '32',
  },
};

export const CROP_RESPONSE_AUCKLAND_2020 = {
  id: generateTestId(),
  surveyCode: 'CROP',
  entityCode: auckland.code,
  submission_time: '2020-11-21T09:00:00Z',
  answers: { CROP_2: '55' },
};

export const CROP_RESPONSE_WELLINGTON_2019 = {
  id: generateTestId(),
  surveyCode: 'CROP',
  entityCode: wellington.code,
  submission_time: '2019-12-16T09:00:00Z',
  answers: {
    CROP_1: '5.1',
    CROP_2: '55',
  },
};

export const SURVEY_RESPONSES = [
  BCD_RESPONSE_AUCKLAND,
  BCD_RESPONSE_WELLINGTON,
  CROP_RESPONSE_WELLINGTON_2019,
  CROP_RESPONSE_AUCKLAND_2019,
  CROP_RESPONSE_AUCKLAND_2020,
];
