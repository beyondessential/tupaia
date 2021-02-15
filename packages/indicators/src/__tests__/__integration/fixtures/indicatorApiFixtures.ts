/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { ArrayTestCase, arrayToTestCase } from './helpers';

const SURVEYS = [
  {
    code: 'FavouriteColour',
    questions: [
      { code: 'Red', type: 'Number' },
      { code: 'Blue', type: 'Number' },
    ],
  },
];
const SURVEY_RESPONSES = [
  {
    surveyCode: 'FavouriteColour',
    entityCode: 'AU',
    submission_time: '2020-12-10T15:00:00Z',
    answers: {
      Red: '10',
      Blue: '20',
    },
  },
];

const INDICATORS = [
  {
    code: 'AllColours',
    builder: 'arithmetic',
    config: {
      formula: 'Red + Blue',
      aggregation: 'RAW',
    },
  },
  {
    code: 'RedAgainstBlue',
    builder: 'arithmetic',
    config: {
      formula: 'Red / Blue',
      aggregation: 'RAW',
    },
  },
  {
    code: 'NonExistingBuilder',
    builder: 'nonExisting',
  },
  {
    code: 'SelfReferencing',
    builder: 'arithmetic',
    config: {
      formula: 'SelfReferencing - 1',
      aggregation: 'RAW',
    },
  },
  {
    code: 'CircularReference_A',
    builder: 'arithmetic',
    config: {
      formula: 'CircularReference_B',
      aggregation: 'RAW',
    },
  },
  {
    code: 'CircularReference_B',
    builder: 'arithmetic',
    config: {
      formula: 'CircularReference_A',
      aggregation: 'RAW',
    },
  },
];

const ARRAY_TEST_CASES: ArrayTestCase[] = [
  [
    'fetches data for multiple indicators',
    ['AllColours', 'RedAgainstBlue'],
    ['2020-01-01', '2020-12-31', ['AU']],
    [
      ['AllColours', 'AU', '20201210', 10 + 20],
      ['RedAgainstBlue', 'AU', '20201210', 10 / 20],
    ],
  ],
  [
    'throws if a requested indicator builder does not exist',
    ['NonExistingBuilder'],
    ['2019-01-01', '2019-12-31', ['TO']],
    "'nonExisting' is not an indicator builder",
  ],
  [
    'throws for self referencing builders',
    ['SelfReferencing'],
    ['2019-01-01', '2019-12-31', ['TO']],
    'Max indicator nesting depth reached',
  ],
  [
    'throws for circular references',
    ['CircularReference_A'],
    ['2019-01-01', '2019-12-31', ['TO']],
    'Max indicator nesting depth reached',
  ],
];

export const indicatorApiFixtures = {
  description: 'Indicator API features',
  setup: {
    dbRecords: {
      entity: [{ code: 'AU', name: 'Australia', type: 'country' }],
      indicator: INDICATORS,
    },
    surveys: SURVEYS,
    surveyResponses: SURVEY_RESPONSES,
  },
  testCases: ARRAY_TEST_CASES.map(arrayToTestCase),
};
