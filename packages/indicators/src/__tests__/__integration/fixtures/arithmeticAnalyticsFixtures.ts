/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import {
  ArraySurveyResponse,
  ArrayTestCase,
  arrayToSurveyResponse,
  arrayToTestCase,
  entriesToArithmeticIndicators,
} from './helpers';

const ENTITIES = [
  { code: 'GR', name: 'Greece', type: 'country' },
  { code: 'IT', name: 'Italy', type: 'country' },
  { code: 'ES', name: 'Spain', type: 'country' },
];

const SURVEYS = [
  {
    code: 'Births',
    questions: [
      { code: 'Female', type: 'Number' },
      { code: 'Male', type: 'Number' },
    ],
  },
];

const ARRAY_SURVEY_RESPONSES: ArraySurveyResponse[] = [
  ['Births', 'GR', '2019-01-01T15:00:00Z', { Female: '1', Male: '2' }],
  ['Births', 'GR', '2020-11-30T15:00:00Z', { Female: '3', Male: '4' }],
  ['Births', 'GR', '2020-12-29T15:00:00Z', { Female: '60', Male: '80' }],
  ['Births', 'GR', '2020-12-30T15:00:00Z', { Female: '6', Male: '8' }],
  ['Births', 'IT', '2019-06-05T15:00:00Z', { Female: '10', Male: '20' }],
  ['Births', 'IT', '2020-07-07T15:00:00Z', { Female: '30', Male: '40' }],
  ['Births', 'ES', '2019-01-01T15:00:00Z', { Female: '3', Male: '3' }],
  ['Births', 'ES', '2019-04-01T15:00:00Z', { Female: '7', Male: '5' }],
  ['Births', 'ES', '2019-07-01T15:00:00Z', { Female: '4', Male: '5' }],
  ['Births', 'ES', '2019-10-01T15:00:00Z', { Female: '9', Male: '9' }],
  ['Births', 'ES', '2020-01-01T15:00:00Z', { Female: '100' }],
  ['Births', 'ES', '2020-02-02T15:00:00Z', { Female: '150', Male: '200' }],
];

const ARITHMETIC_INDICATOR_ENTRIES: Record<string, Record<string, unknown>> = {
  EmptyConfig: {},
  MonthlyBirths: {
    formula: 'Female + Male',
    aggregation: 'FINAL_EACH_MONTH',
  },
  MonthlyBirths_MonthlyBirths_ZeroDefaults: {
    formula: 'Female + Male',
    aggregation: 'FINAL_EACH_MONTH',
    defaultValues: { Female: 0, Male: 0 },
  },
  AnnualBirths: {
    formula: 'Female + Male',
    aggregation: ['FINAL_EACH_MONTH', 'SUM_EACH_YEAR'],
  },
  MonthlyBirthIncreaseRatio: {
    formula: '(Female + Male) / MonthlyBirths',
    aggregation: {
      Female: 'FINAL_EACH_MONTH',
      Male: 'FINAL_EACH_MONTH',
      MonthlyBirths: [
        'FINAL_EACH_MONTH',
        { type: 'OFFSET_PERIOD', config: { periodType: 'MONTH', offset: 1 } },
      ],
    },
  },
  AnnualBirthIncreaseRatio: {
    formula: 'AnnualBirths / annualBirthsPrevYear',
    parameters: {
      annualBirthsPrevYear: {
        formula: 'AnnualBirths',
        aggregation: { type: 'OFFSET_PERIOD', config: { periodType: 'YEAR', offset: 1 } },
      },
    },
    aggregation: 'FINAL_EACH_YEAR',
  },
  FemaleGtMale: {
    formula: 'Female > Male',
    aggregation: 'FINAL_EACH_MONTH',
  },
  MaleGtFemale: {
    formula: 'Male > Female',
    aggregation: 'FINAL_EACH_MONTH',
  },
  TotalBirths: {
    formula: 'MonthlyBirths',
    aggregation: 'SUM',
  },
  QuarterlyIncrease: {
    formula: 'TotalBirths - prevQuarterTotalBirths',
    parameters: {
      prevQuarterTotalBirths: {
        formula: 'TotalBirths',
        aggregation: [{ type: 'OFFSET_PERIOD', config: { offset: 1, periodType: 'QUARTER' } }],
      },
    },
    aggregation: 'FINAL_EACH_QUARTER',
  },
  AverageOf3QuarterlyIncreases: {
    formula: 'avg(QuarterlyIncrease, prevQuarterIncrease, prev2QuartersIncrease)',
    parameters: {
      prevQuarterIncrease: {
        formula: 'QuarterlyIncrease',
        aggregation: [{ type: 'OFFSET_PERIOD', config: { offset: 1, periodType: 'QUARTER' } }],
      },
      prev2QuartersIncrease: {
        formula: 'QuarterlyIncrease',
        aggregation: [{ type: 'OFFSET_PERIOD', config: { offset: 2, periodType: 'QUARTER' } }],
      },
    },
    aggregation: 'FINAL_EACH_QUARTER',
  },
};

const ARRAY_TEST_CASES: ArrayTestCase[] = [
  [
    'Throws if config is empty',
    ['EmptyConfig'],
    ['2019-01-01', '2020-12-31', ['TO']],
    'Should not be empty',
  ],
  [
    'Returns empty results if org unit has no data',
    ['MonthlyBirths'],
    ['2019-01-01', '2020-12-31', ['TO']],
    [],
  ],
  [
    'Returns empty results if org unit has no data',
    ['MonthlyBirths'],
    ['2019-01-01', '2020-12-31', ['TO']],
    [],
  ],
  [
    'Returns empty results if date range has no data',
    ['MonthlyBirths'],
    ['2017-01-01', '2017-12-31', ['GR']],
    [],
  ],
  [
    'Evaluates an arithmetic formula',
    ['MonthlyBirths'],
    ['2019-01-01', '2019-01-31', ['GR']],
    [['MonthlyBirths', 'GR', '20190101', 3]],
  ],
  [
    'Evaluates a boolean formula (result: true)',
    ['MaleGtFemale'],
    ['2019-01-01', '2019-01-31', ['GR']],
    [['MaleGtFemale', 'GR', '20190101', 1]],
  ],
  [
    'Evaluates a boolean formula (result: false)',
    ['FemaleGtMale'],
    ['2019-01-01', '2019-01-31', ['GR']],
    [['FemaleGtMale', 'GR', '20190101', 0]],
  ],
  [
    'Applies correct aggregation (string format)',
    ['MonthlyBirths'],
    ['2020-01-01', '2020-12-31', ['GR']],
    [
      ['MonthlyBirths', 'GR', '20201130', 7],
      ['MonthlyBirths', 'GR', '20201230', 14],
    ],
  ],
  [
    'Applies correct aggregation (array format)',
    ['AnnualBirths'],
    ['2020-01-01', '2020-12-31', ['GR']],
    [['AnnualBirths', 'GR', '2020', 21]],
  ],
  [
    'Applies correct aggregation (object format)',
    ['MonthlyBirthIncreaseRatio'],
    ['2020-12-01', '2020-12-31', ['GR']],
    [['MonthlyBirthIncreaseRatio', 'GR', '20201230', 2]],
  ],
  [
    'Nested indicator + inline indicator (parameter)',
    ['AnnualBirthIncreaseRatio'],
    ['2019-01-01', '2020-12-31', ['GR']],
    [['AnnualBirthIncreaseRatio', 'GR', '2020', 7]],
  ],
  [
    'Skips calculation if an element is not defined in a specific org unit/date range combo',
    ['MonthlyBirths'],
    ['2020-01-01', '2020-12-31', ['ES']],
    [['MonthlyBirths', 'ES', '20200202', 350]],
  ],
  [
    'Uses default values if provided',
    ['MonthlyBirths_MonthlyBirths_ZeroDefaults'],
    ['2020-01-01', '2020-12-31', ['ES']],
    [
      ['MonthlyBirths_MonthlyBirths_ZeroDefaults', 'ES', '20200101', 100],
      ['MonthlyBirths_MonthlyBirths_ZeroDefaults', 'ES', '20200202', 350],
    ],
  ],
  [
    'Calculates data across organisation units and periods',
    ['AnnualBirths'],
    ['2019-01-01', '2020-12-31', ['GR', 'IT']],
    [
      ['AnnualBirths', 'GR', '2019', 3],
      ['AnnualBirths', 'IT', '2019', 30],
      ['AnnualBirths', 'GR', '2020', 21],
      ['AnnualBirths', 'IT', '2020', 70],
    ],
  ],
  [
    'Applies correct aggregation in nested indicators',
    ['AverageOf3QuarterlyIncreases'],
    ['2019-10-01', '2019-12-31', ['ES']],
    [['AverageOf3QuarterlyIncreases', 'ES', '20191001', (6 - 3 + 9) / 3]],
  ],
];

export const arithmeticAnalyticsFixtures = {
  description: 'Arithmetic analytics',
  setup: {
    dbRecords: {
      entity: ENTITIES,
      indicator: entriesToArithmeticIndicators(ARITHMETIC_INDICATOR_ENTRIES),
    },
    surveys: SURVEYS,
    surveyResponses: ARRAY_SURVEY_RESPONSES.map(arrayToSurveyResponse),
  },
  testCases: ARRAY_TEST_CASES.map(arrayToTestCase),
};
