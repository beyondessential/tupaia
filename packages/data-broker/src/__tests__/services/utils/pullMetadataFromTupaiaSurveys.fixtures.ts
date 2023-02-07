/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

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
  questions: [BCD1, BCD57, BCD325, BCD902],
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
  name: 'Which cat?',
  type: 'Text',
  option_set_id: 'cats',
  options: [],
};

const KITTY_2 = {
  code: 'KITTY_2',
  name: 'Number of hours slept',
  type: 'Number',
  options: [],
};

const KITTY_SURVEY = {
  code: 'KITTY',
  name: 'Cat assessment',
  questions: [KITTY_1, KITTY_2],
};

const CAT_1 = {
  option_set_id: 'cats',
  value: 'Momo',
  label: "Rohan's cat",
};

const CAT_2 = {
  option_set_id: 'cats',
  value: 'Ramen',
  label: "Biao's cat",
};

const EMPTY_SURVEY = {
  code: 'EMPTY',
  name: 'Empty Survey',
  questions: [],
};

export const QUESTIONS = [BCD1, BCD325, BCD57, BCD902, CROP_1, CROP_2, KITTY_1, KITTY_2];
export const SURVEYS = [BCD_SURVEY, CROP_SURVEY, KITTY_SURVEY, EMPTY_SURVEY];
export const OPTIONS = [CAT_1, CAT_2];
