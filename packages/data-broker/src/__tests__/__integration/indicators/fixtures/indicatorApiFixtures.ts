import { ArrayTestCase, arrayToTestCase } from './helpers';

const SURVEYS = [
  {
    code: 'FavouriteColour',
    questions: [
      { code: 'Red', type: 'Number' },
      { code: 'Blue', type: 'Number' },
    ],
  },
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
    surveyCode: 'FavouriteColour',
    entityCode: 'AU',
    data_time: '2020-12-10T15:00:00',
    answers: {
      Red: '10',
      Blue: '20',
    },
  },
  {
    surveyCode: 'Births',
    entityCode: 'AU',
    data_time: '2020-12-11T15:00:00',
    answers: {
      Name: 'John',
      Weight: '3',
      Gender: 'Male',
    },
  },
  {
    surveyCode: 'Births',
    entityCode: 'AU',
    data_time: '2020-12-12T15:00:00',
    answers: {
      Name: 'Lisa',
      Weight: '4',
      Gender: 'Female',
    },
  },
];

const INDICATORS = [
  {
    code: 'AllColours',
    builder: 'analyticArithmetic',
    config: {
      formula: 'Red + Blue',
      aggregation: 'RAW',
    },
  },
  {
    code: 'RedAgainstBlue',
    builder: 'analyticArithmetic',
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
    builder: 'analyticArithmetic',
    config: {
      formula: 'SelfReferencing - 1',
      aggregation: 'RAW',
    },
  },
  {
    code: 'CircularReference_A',
    builder: 'analyticArithmetic',
    config: {
      formula: 'CircularReference_B',
      aggregation: 'RAW',
    },
  },
  {
    code: 'CircularReference_B',
    builder: 'analyticArithmetic',
    config: {
      formula: 'CircularReference_A',
      aggregation: 'RAW',
    },
  },
  {
    code: 'MaleWeightLessThan4',
    builder: 'eventCheckConditions',
    config: {
      formula: "equalText(Gender, 'Male') and Weight < 4",
      programCode: 'Births',
    },
  },
];

const ARRAY_TEST_CASES: ArrayTestCase[] = [
  [
    'fetches data for multiple analytic arithmetic indicators',
    ['AllColours', 'RedAgainstBlue'],
    ['2020-01-01', '2020-12-31', ['AU']],
    [
      ['AllColours', 'AU', '20201210', 10 + 20],
      ['RedAgainstBlue', 'AU', '20201210', 10 / 20],
    ],
  ],
  [
    'fetches data for multiple types of indicators',
    ['AllColours', 'MaleWeightLessThan4'],
    ['2020-01-01', '2020-12-31', ['AU']],
    [
      ['AllColours', 'AU', '20201210', 10 + 20],
      ['MaleWeightLessThan4', 'AU', '20201211', 1],
      ['MaleWeightLessThan4', 'AU', '20201212', 0],
    ],
  ],
  [
    'throws if a requested indicator builder does not exist',
    ['NonExistingBuilder'],
    ['2019-01-01', '2019-12-31', ['AU']],
    "'nonExisting' is not an indicator builder",
  ],
];

export const indicatorApiFixtures = {
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
