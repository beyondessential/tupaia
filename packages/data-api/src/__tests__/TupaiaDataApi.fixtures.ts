import { generateId } from '@tupaia/database';

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

const nz = {
  code: 'NZ',
  name: 'New Zealand',
  type: 'country',
};

export const ENTITIES = [auckland, wellington];

export const CITY_TO_COUNTRY_MAP = {
  [auckland.code]: nz,
  [wellington.code]: nz,
};

const BCD1 = {
  code: 'BCD1TEST',
  name: 'Facility Status',
  type: 'Radio',
  text: 'What the status of the facility?',
  options: [],
};

const BCD325 = {
  code: 'BCD325TEST',
  name: 'Days of operation',
  type: 'Number',
  text: 'How many days has the facility been operational?',
  options: [],
};

const BCD57 = {
  code: 'BCD57TEST',
  name: 'Foundation',
  type: 'Radio',
  text: 'What foundations is it built on?',
  options: [
    'Concrete slab',
    'Concrete stumps',
    'Timber stumps',
    'Timber on ground',
    'Earth',
    'Other',
  ],
};

const BCD902 = {
  code: 'BCD902TEST',
  name: 'Terrain',
  type: 'Radio',
  text: 'What kind of terrain?',
  options: [
    { value: 'rock', label: 'Rocky terrain' },
    '{ "value": "sea", "label": "The Ocean" }',
    { value: 'Fire' },
    '{ "value": "Space" }',
    'Earth',
    'Other',
  ],
};

const BCD_SURVEY = {
  code: 'BCDTEST',
  name: 'Basic Clinic Data Test',
  questions: [BCD1, BCD325, BCD57, BCD902],
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

const KITTY_1 = {
  code: 'KITTY_1',
  name: 'Number of hours slept',
  type: 'Number',
  options: [],
};

const KITTY_2 = {
  code: 'KITTY_2',
  name: 'Amount of food eaten (cal)',
  type: 'Number',
  options: [],
};

const KITTY_SURVEY = {
  code: 'KITTY',
  name: 'Cat assessment',
  questions: [KITTY_1, KITTY_2],
};

export const SURVEYS = [BCD_SURVEY, CROP_SURVEY, KITTY_SURVEY];

export const BCD_RESPONSE_AUCKLAND = {
  id: generateId(),
  surveyCode: BCD_SURVEY.code,
  entityCode: auckland.code,
  data_time: '2020-01-31T09:00:00',
  answers: {
    [BCD1.code]: 'Fully operational',
    [BCD325.code]: '53',
  },
};

export const BCD_RESPONSE_WELLINGTON = {
  id: generateId(),
  surveyCode: BCD_SURVEY.code,
  entityCode: wellington.code,
  data_time: '2020-02-05T15:00:00',
  answers: {
    [BCD1.code]: 'Temporarily closed',
    [BCD325.code]: '0',
  },
};

export const CROP_RESPONSE_AUCKLAND_2019 = {
  id: generateId(),
  surveyCode: CROP_SURVEY.code,
  entityCode: auckland.code,
  data_time: '2019-11-21T09:00:00',
  answers: {
    [CROP_1.code]: '105',
    [CROP_2.code]: '32',
  },
};

export const CROP_RESPONSE_AUCKLAND_2020 = {
  id: generateId(),
  surveyCode: CROP_SURVEY.code,
  entityCode: auckland.code,
  data_time: '2020-11-21T09:00:00',
  answers: {
    [CROP_2.code]: '55',
  },
};

export const CROP_RESPONSE_WELLINGTON_2019 = {
  id: generateId(),
  surveyCode: CROP_SURVEY.code,
  entityCode: wellington.code,
  data_time: '2019-12-16T09:00:00',
  answers: {
    [CROP_1.code]: '5.1',
    [CROP_2.code]: '66',
  },
};

export const KITTY_RESPONSE_WELLINGTON_MORNING_20210104W1 = {
  id: generateId(),
  surveyCode: KITTY_SURVEY.code,
  entityCode: wellington.code,
  data_time: '2021-01-04T09:00:00Z',
  answers: {
    [KITTY_1.code]: '18.4',
    [KITTY_2.code]: '50',
  },
};

export const KITTY_RESPONSE_WELLINGTON_MIDDAY_20210104W1 = {
  id: generateId(),
  surveyCode: KITTY_SURVEY.code,
  entityCode: wellington.code,
  data_time: '2021-01-04T09:01:00Z',
  answers: {
    [KITTY_1.code]: '12.4',
    [KITTY_2.code]: '60',
  },
};

export const KITTY_RESPONSE_WELLINGTON_NIGHT_20210104W1 = {
  id: generateId(),
  surveyCode: KITTY_SURVEY.code,
  entityCode: wellington.code,
  data_time: '2021-01-04T09:02:00Z',
  answers: {
    [KITTY_1.code]: '14.4',
    [KITTY_2.code]: '62',
  },
};

export const KITTY_RESPONSE_WELLINGTON_MORNING_20210105W1 = {
  id: generateId(),
  surveyCode: KITTY_SURVEY.code,
  entityCode: wellington.code,
  data_time: '2021-01-05T09:00:00Z',
  answers: {
    [KITTY_1.code]: '17.4',
    [KITTY_2.code]: '52',
  },
};

export const KITTY_RESPONSE_WELLINGTON_NIGHT_20210105W1 = {
  id: generateId(),
  surveyCode: KITTY_SURVEY.code,
  entityCode: wellington.code,
  data_time: '2021-01-05T09:02:00Z',
  answers: {
    [KITTY_1.code]: '19.4',
    [KITTY_2.code]: '40',
  },
};

export const KITTY_RESPONSE_WELLINGTON_MORNING_20210113W2 = {
  id: generateId(),
  surveyCode: KITTY_SURVEY.code,
  entityCode: wellington.code,
  data_time: '2021-01-13T09:00:00Z',
  answers: {
    [KITTY_1.code]: '23.4',
    [KITTY_2.code]: '6',
  },
};

export const KITTY_RESPONSE_WELLINGTON_MORNING_20210115W2 = {
  id: generateId(),
  surveyCode: KITTY_SURVEY.code,
  entityCode: wellington.code,
  data_time: '2021-01-15T09:00:00Z',
  answers: {
    [KITTY_1.code]: '13.4',
    [KITTY_2.code]: '67',
  },
};

export const KITTY_RESPONSE_WELLINGTON_MORNING_20210205W5 = {
  id: generateId(),
  surveyCode: KITTY_SURVEY.code,
  entityCode: wellington.code,
  data_time: '2021-02-05T09:00:00Z',
  answers: {
    [KITTY_1.code]: '16.4',
    [KITTY_2.code]: '87',
  },
};

export const KITTY_RESPONSE_WELLINGTON_MORNING_20210219W7 = {
  id: generateId(),
  surveyCode: KITTY_SURVEY.code,
  entityCode: wellington.code,
  data_time: '2021-02-19T09:00:00Z',
  answers: {
    [KITTY_1.code]: '17.4',
    [KITTY_2.code]: '47',
  },
};

export const KITTY_RESPONSE_WELLINGTON_MORNING_20220606W23 = {
  id: generateId(),
  surveyCode: KITTY_SURVEY.code,
  entityCode: wellington.code,
  data_time: '2022-06-06T09:00:00Z',
  answers: {
    [KITTY_1.code]: '8.4',
    [KITTY_2.code]: '187',
  },
};

export const KITTY_RESPONSE_WELLINGTON_MORNING_20220608W23 = {
  id: generateId(),
  surveyCode: KITTY_SURVEY.code,
  entityCode: wellington.code,
  data_time: '2022-06-08T08:00:00Z',
  answers: {
    [KITTY_1.code]: '19.4',
    [KITTY_2.code]: '36',
  },
};

export const KITTY_RESPONSE_AUCKLAND_MORNING_20210608W23 = {
  id: generateId(),
  surveyCode: KITTY_SURVEY.code,
  entityCode: auckland.code,
  data_time: '2021-06-08T09:00:00Z',
  answers: {
    [KITTY_1.code]: '15.4',
    [KITTY_2.code]: '63',
  },
};

export const KITTY_RESPONSE_AUCKLAND_MORNING_20220608W23 = {
  id: generateId(),
  surveyCode: KITTY_SURVEY.code,
  entityCode: auckland.code,
  data_time: '2022-06-08T09:00:00Z',
  answers: {
    [KITTY_1.code]: '12.4',
    [KITTY_2.code]: '360',
  },
};

export type SurveyResponse = {
  id: string;
  surveyCode: string;
  entityCode: string;
  data_time: string;
  answers: Record<string, string>;
};

export const SURVEY_RESPONSES: SurveyResponse[] = [
  BCD_RESPONSE_AUCKLAND,
  BCD_RESPONSE_WELLINGTON,
  CROP_RESPONSE_WELLINGTON_2019,
  CROP_RESPONSE_AUCKLAND_2019,
  CROP_RESPONSE_AUCKLAND_2020,
  KITTY_RESPONSE_WELLINGTON_MORNING_20210104W1,
  KITTY_RESPONSE_WELLINGTON_MIDDAY_20210104W1,
  KITTY_RESPONSE_WELLINGTON_NIGHT_20210104W1,
  KITTY_RESPONSE_WELLINGTON_MORNING_20210105W1,
  KITTY_RESPONSE_WELLINGTON_NIGHT_20210105W1,
  KITTY_RESPONSE_WELLINGTON_MORNING_20210113W2,
  KITTY_RESPONSE_WELLINGTON_MORNING_20210115W2,
  KITTY_RESPONSE_WELLINGTON_MORNING_20210205W5,
  KITTY_RESPONSE_WELLINGTON_MORNING_20210219W7,
  KITTY_RESPONSE_WELLINGTON_MORNING_20220606W23,
  KITTY_RESPONSE_WELLINGTON_MORNING_20220608W23,
  KITTY_RESPONSE_AUCKLAND_MORNING_20210608W23,
  KITTY_RESPONSE_AUCKLAND_MORNING_20220608W23,
];

export const SETUP = {
  dbRecords: {
    entity: ENTITIES,
  },
  surveys: SURVEYS,
  surveyResponses: SURVEY_RESPONSES,
};
