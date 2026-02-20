import {
  ArraySurveyResponse,
  ArrayTestCase,
  arrayToSurveyResponse,
  arrayToTestCase,
  entriesToEventCheckConditionsIndicators,
} from './helpers';

const ENTITIES = [
  { code: 'AU', name: 'Australia', type: 'country' },
  { code: 'NZ', name: 'New Zealand', type: 'country' },
];

const SURVEYS = [
  {
    code: 'Covid_19_Cases',
    questions: [
      { code: 'Quarantine_Place', type: 'Radio' },
      { code: 'Positive', type: 'Binary' },
      { code: 'Age', type: 'Number' },
    ],
  },
];

const ARRAY_SURVEY_RESPONSES: ArraySurveyResponse[] = [
  // AU
  ['Covid_19_Cases', 'AU', '2020-03-01', { Quarantine_Place: 'Hotel', Positive: 'Yes', Age: '20' }],
  ['Covid_19_Cases', 'AU', '2020-04-30', { Quarantine_Place: 'Home', Positive: 'No', Age: '25' }],
  ['Covid_19_Cases', 'AU', '2020-05-29', { Quarantine_Place: 'Hotel', Positive: 'No', Age: '38' }],
  ['Covid_19_Cases', 'AU', '2020-06-25', { Quarantine_Place: 'Home', Positive: 'Yes', Age: '40' }],
  // NZ
  ['Covid_19_Cases', 'NZ', '2020-03-01', { Quarantine_Place: 'Hotel', Positive: 'Yes', Age: '35' }],
  ['Covid_19_Cases', 'NZ', '2020-03-30', { Quarantine_Place: 'Home', Positive: 'No', Age: '23' }],
  ['Covid_19_Cases', 'NZ', '2020-04-30', { Quarantine_Place: 'Home', Age: '23' }], // Missing Positive
];

const EVENT_CHECK_CONDITIONS_INDICATOR_ENTRIES: Record<string, Record<string, unknown>> = {
  EventCheckConditionsEmptyConfig: {},
  EventCheckConditionsNoProgramCodeConfig: {
    formula: "equalText(Quarantine_Place, 'Home')",
  },
  NoneQuarantineDefault: {
    formula: "equalText(Quarantine_Place, 'Home') and Positive == 0",
    programCode: 'Covid_19_Cases',
    defaultValues: {
      Positive: 0,
      Quarantine_Place: 'None',
    },
  },
  HomeQuarantine: {
    formula: "equalText(Quarantine_Place, 'Home')",
    programCode: 'Covid_19_Cases',
  },
  PositiveCaseHomeQuarantineOver25: {
    formula: "equalText(Quarantine_Place, 'Home') and Positive == 1 and Age > 25",
    programCode: 'Covid_19_Cases',
  },
};

const ARRAY_TEST_CASES: ArrayTestCase[] = [
  [
    'Throws if config is empty',
    ['EventCheckConditionsEmptyConfig'],
    ['2020-01-01', '2020-12-31', ['TO']],
    'Expected nonempty value but got undefined',
  ],
  [
    'Throws if config has no programCode',
    ['EventCheckConditionsNoProgramCodeConfig'],
    ['2020-01-01', '2020-12-31', ['NZ']],
    "Error in field 'programCode': Expected nonempty value but got undefined",
  ],
  [
    'Populate default values if a data value is missing',
    ['NoneQuarantineDefault'],
    ['2020-01-01', '2020-12-31', ['NZ']],
    [
      ['NoneQuarantineDefault', 'NZ', '20200301', 0],
      ['NoneQuarantineDefault', 'NZ', '20200330', 1],
      ['NoneQuarantineDefault', 'NZ', '20200430', 1],
    ],
  ],
  [
    'Returns empty results if org unit has no data',
    ['HomeQuarantine'],
    ['2020-01-01', '2020-12-31', ['TO']],
    [],
  ],
  [
    'Returns empty results if date range has no data',
    ['HomeQuarantine'],
    ['2017-01-01', '2017-12-31', ['AU']],
    [],
  ],
  [
    'Evaluates a boolean formula with single condition',
    ['HomeQuarantine'],
    ['2020-01-01', '2020-12-31', ['AU']],
    [
      ['HomeQuarantine', 'AU', '20200301', 0],
      ['HomeQuarantine', 'AU', '20200430', 1],
      ['HomeQuarantine', 'AU', '20200529', 0],
      ['HomeQuarantine', 'AU', '20200625', 1],
    ],
  ],
  [
    'Evaluates a boolean formula with multiple conditions',
    ['PositiveCaseHomeQuarantineOver25'],
    ['2020-01-01', '2020-12-31', ['AU']],
    [
      ['PositiveCaseHomeQuarantineOver25', 'AU', '20200301', 0],
      ['PositiveCaseHomeQuarantineOver25', 'AU', '20200430', 0],
      ['PositiveCaseHomeQuarantineOver25', 'AU', '20200529', 0],
      ['PositiveCaseHomeQuarantineOver25', 'AU', '20200625', 1],
    ],
  ],
];

export const eventCheckConditionsFixtures = {
  setup: {
    dbRecords: {
      entity: ENTITIES,
      indicator: entriesToEventCheckConditionsIndicators(EVENT_CHECK_CONDITIONS_INDICATOR_ENTRIES),
    },
    surveys: SURVEYS,
    surveyResponses: ARRAY_SURVEY_RESPONSES.map(arrayToSurveyResponse),
  },
  testCases: ARRAY_TEST_CASES.map(arrayToTestCase),
};
