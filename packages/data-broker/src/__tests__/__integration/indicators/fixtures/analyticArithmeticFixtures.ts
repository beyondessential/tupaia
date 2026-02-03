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
  { code: 'TO', name: 'Tonga', type: 'country' },
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
  // GR
  ['Births', 'GR', '2019-01-01', { Female: '1', Male: '2' }],
  ['Births', 'GR', '2020-11-30', { Female: '3', Male: '4' }],
  ['Births', 'GR', '2020-12-29', { Female: '60', Male: '80' }],
  ['Births', 'GR', '2020-12-31', { Female: '6', Male: '8' }],
  // IT
  ['Births', 'IT', '2019-06-05', { Female: '10', Male: '20' }],
  ['Births', 'IT', '2020-07-07', { Female: '30', Male: '40' }],
  // ES
  ['Births', 'ES', '2019-01-01', { Female: '0', Male: '1' }],
  ['Births', 'ES', '2019-02-01', { Female: '2', Male: '3' }],
  ['Births', 'ES', '2019-04-01', { Female: '2', Male: '3' }],
  ['Births', 'ES', '2019-05-01', { Female: '3', Male: '4' }],
  ['Births', 'ES', '2019-07-01', { Female: '1', Male: '2' }],
  ['Births', 'ES', '2019-08-01', { Female: '3', Male: '3' }],
  ['Births', 'ES', '2019-10-01', { Female: '3', Male: '4' }],
  ['Births', 'ES', '2019-11-01', { Female: '5', Male: '6' }],
  ['Births', 'ES', '2020-01-01', { Female: '100' }],
  ['Births', 'ES', '2020-02-02', { Female: '150', Male: '200' }],
];

const ARITHMETIC_INDICATOR_ENTRIES: Record<string, Record<string, unknown>> = {
  EmptyConfig: {},
  MonthlyBirths: {
    formula: 'Female + Male',
    aggregation: 'FINAL_EACH_MONTH',
  },
  MonthlyBirthsZeroDefaults: {
    formula: 'Female + Male',
    aggregation: 'FINAL_EACH_MONTH',
    defaultValues: { Female: 0, Male: 0 },
  },
  MonthlyBirthIncreaseRate: {
    formula: '(Female + Male - MonthlyBirths) / MonthlyBirths',
    aggregation: {
      Female: 'FINAL_EACH_MONTH',
      Male: 'FINAL_EACH_MONTH',
      MonthlyBirths: [
        'FINAL_EACH_MONTH',
        { type: 'OFFSET_PERIOD', config: { periodType: 'MONTH', offset: 1 } },
      ],
    },
  },
  AnnualBirths: {
    formula: 'Female + Male',
    aggregation: ['FINAL_EACH_MONTH', 'SUM_EACH_YEAR'],
  },
  AnnualBirthIncreaseRate: {
    formula: '(AnnualBirths - annualBirthsPrevYear) / annualBirthsPrevYear',
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
    'Expected nonempty value but got undefined',
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
    [['MonthlyBirths', 'GR', '201901', 3]],
  ],
  [
    'Evaluates a boolean formula (result: true)',
    ['MaleGtFemale'],
    ['2019-01-01', '2019-01-31', ['GR']],
    [['MaleGtFemale', 'GR', '201901', 1]],
  ],
  [
    'Evaluates a boolean formula (result: false)',
    ['FemaleGtMale'],
    ['2019-01-01', '2019-01-31', ['GR']],
    [['FemaleGtMale', 'GR', '201901', 0]],
  ],
  [
    'Applies correct aggregation (string format)',
    ['MonthlyBirths'],
    ['2020-01-01', '2020-12-31', ['GR']],
    [
      ['MonthlyBirths', 'GR', '202011', 7],
      ['MonthlyBirths', 'GR', '202012', 14],
    ],
  ],
  [
    'Applies correct aggregation (array format)',
    ['AnnualBirths'],
    ['2020-01-01', '2020-12-31', ['GR']],
    [['AnnualBirths', 'GR', '2020', 7 + 14]],
  ],
  [
    'Applies correct aggregation (object format)',
    ['MonthlyBirthIncreaseRate'],
    ['2020-12-01', '2020-12-31', ['GR']],
    [['MonthlyBirthIncreaseRate', 'GR', '202012', (14 - 7) / 7]],
  ],
  [
    'Nested indicator + inline indicator (parameter)',
    ['AnnualBirthIncreaseRate'],
    ['2019-01-01', '2020-12-31', ['GR']],
    [['AnnualBirthIncreaseRate', 'GR', '2020', (7 + 14 - 3) / 3]],
  ],
  [
    'Skips calculation if an element is not defined in a specific org unit/date range combo',
    ['MonthlyBirths'],
    ['2020-01-01', '2020-12-31', ['ES']],
    [['MonthlyBirths', 'ES', '202002', 350]],
  ],
  [
    'Uses default values if provided',
    ['MonthlyBirthsZeroDefaults'],
    ['2020-01-01', '2020-12-31', ['ES']],
    [
      ['MonthlyBirthsZeroDefaults', 'ES', '202001', 100],
      ['MonthlyBirthsZeroDefaults', 'ES', '202002', 350],
    ],
  ],
  [
    'Calculates data across organisation units and periods',
    ['AnnualBirths'],
    ['2019-01-01', '2020-12-31', ['GR', 'IT']],
    [
      ['AnnualBirths', 'GR', '2019', 3],
      ['AnnualBirths', 'IT', '2019', 30],
      ['AnnualBirths', 'IT', '2020', 70],
      ['AnnualBirths', 'GR', '2020', 7 + 14],
    ],
  ],
  [
    'Applies correct aggregation in nested indicators',
    ['AverageOf3QuarterlyIncreases'],
    ['2019-10-01', '2019-12-31', ['ES']],
    [['AverageOf3QuarterlyIncreases', 'ES', '2019Q4', (12 - 6 + (9 - 12) + (18 - 9)) / 3]],
  ],
];

export const arithmeticAnalyticFixtures = {
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
