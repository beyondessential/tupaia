/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { ArrayTestCase, arrayToTestCase } from '../helpers';

const SURVEYS = [
  {
    code: 'Births',
    questions: [
      { code: 'Name', type: 'FreeText' },
      { code: 'Weight', type: 'Number' },
      { code: 'Gender', type: 'Radio' },
    ],
  },
];
const SURVEY_RESPONSES = [
  {
    surveyCode: 'Births',
    entityCode: 'AU',
    submission_time: '2020-12-10T15:00:00Z',
    answers: {
      Name: 'John',
      Weight: '3',
      Gender: 'Male',
    },
  },
  {
    surveyCode: 'Births',
    entityCode: 'AU',
    submission_time: '2020-12-11T15:00:00Z',
    answers: {
      Name: 'Lisa',
      Weight: '4',
      Gender: 'Female',
    },
  },
];

const INDICATORS = [
  {
    code: 'MaleWeightLessThan4',
    builder: 'eventCount',
    config: {
      formula: "equalText(Gender, 'Male') and Weight < 4",
      programCode: 'Births',
    },
  },
  {
    code: 'FemaleWeightMoreThan3',
    builder: 'eventCount',
    config: {
      formula: "equalText(Gender, 'Female') and Weight > 3",
      programCode: 'Births',
    },
  },
  {
    code: 'NonExistingBuilder',
    builder: 'nonExisting',
  },
];

const ARRAY_TEST_CASES: ArrayTestCase[] = [
  [
    'fetches data for multiple event count indicators',
    ['MaleWeightLessThan4', 'FemaleWeightMoreThan3'],
    ['2020-01-01', '2020-12-31', ['AU']],
    [
      ['MaleWeightLessThan4', 'AU', '20201210', 1],
      ['FemaleWeightMoreThan3', 'AU', '20201210', 0],
      ['MaleWeightLessThan4', 'AU', '20201211', 0],
      ['FemaleWeightMoreThan3', 'AU', '20201211', 1],
    ],
  ],
  [
    'throws if a requested indicator builder does not exist',
    ['NonExistingBuilder'],
    ['2019-01-01', '2019-12-31', ['TO']],
    "'nonExisting' is not an indicator builder",
  ],
];

export const eventCountIndicatorApiFixtures = {
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
