/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

/**
 * Note: this file includes data that are referenced or used in import spreadsheets
 */

import { findOrCreateRecords, generateTestId } from '@tupaia/database';
import { upperFirst } from '@tupaia/utils';

const ID_LENGTH = 24;

export const VALIDATION_SURVEY = {
  id: generateTestId(),
  code: 'Test_Import_Validation',
  name: 'Test Import Validation',
  questions: [
    {
      id: 'radio_question______test',
      code: 'Test_Import_Validation_Radio',
      type: 'Radio',
      options: [
        'Fully Operational',
        'Operational but closed this week',
        'Temporarily Closed',
        'Permanently Closed',
      ],
    },
    {
      id: 'freeText_question___test',
      code: 'Test_Import_Validation_FreeText',
      type: 'FreeText',
    },
    {
      id: 'number__question____test',
      code: 'Test_Import_Validation_Number',
      type: 'Number',
    },
    {
      id: 'binary__question____test',
      code: 'Test_Import_Validation_Binary',
      type: 'Binary',
    },
  ],
};

export const CLINIC_DATA_SURVEY = {
  id: generateTestId(),
  code: 'Test_Clinic_Data',
  name: 'Test Clinic Data',
  questions: [
    {
      id: 'tcd_facility_open___test',
      code: 'TCD_Facility_open',
      options: [
        'Fully Operational',
        'Operational but closed this week',
        'Temporarily Closed',
        'Permanently Closed',
      ],
      type: 'Radio',
    },
    {
      id: 'tcd_func_landline___test',
      code: 'TCD_Func_landline',
      type: 'Binary',
    },
    {
      id: 'tcd_best_network____test',
      code: 'TCD_Best_network',
      type: 'FreeText',
    },
    {
      id: 'tcd_contact_number__test',
      code: 'TCD_Contact_number',
      type: 'Number',
    },
    {
      id: 'tcd_major_damage____test',
      code: 'TCD_major_damage',
      type: 'FreeText',
    },
  ],
};

export const FACILITY_FUNDAMENTALS_SURVEY = {
  id: generateTestId(),
  code: 'Test_Facility_Fundamentals',
  name: 'Test Facility Fundamentals',
  questions: [
    {
      id: 'tff_other_names_____test',
      code: 'TFF_Other_names',
      type: 'FreeText',
    },
    {
      id: 'tff_catchment_pop___test',
      code: 'TFF_Catchment_pop',
      type: 'Number',
    },
  ],
};

export const createPeriodicSurvey = periodGranularity => ({
  id: generateTestId(),
  code: `Test_${upperFirst(periodGranularity)}`, // Test_Yearly
  name: `Test ${upperFirst(periodGranularity)}`, // Test Yearly
  period_granularity: periodGranularity,
  questions: ['bird', 'cat', 'dog'].map(baseName => {
    const baseId = `${periodGranularity}_${baseName}_test`;
    const idChars = baseId.split('');
    idChars.splice(-5, 0, '_'.repeat(ID_LENGTH - baseId.length)); // fill with '_' in the middle

    return {
      id: idChars.join(''), // yearly_bird_________test
      code: `Test_${upperFirst(periodGranularity)}_${upperFirst(baseName)}`, //  Test_Yearly_Bird
      type: 'FreeText',
    };
  }),
});

export const YEARLY_SURVEY = createPeriodicSurvey('yearly');
export const QUARTERLY_SURVEY = createPeriodicSurvey('quarterly');
export const MONTHLY_SURVEY = createPeriodicSurvey('monthly');
export const WEEKLY_SURVEY = createPeriodicSurvey('weekly');
export const DAILY_SURVEY = createPeriodicSurvey('daily');

export const createSurveyResponses = async (models, responseIdsBySurvey) => {
  const user = await models.user.findOne();
  const entity = await models.entity.findOne();
  const responseRecords = Object.entries(responseIdsBySurvey)
    .map(([surveyId, responseIds]) =>
      responseIds.map(id => ({
        id,
        survey_id: surveyId,
        user_id: user.id,
        entity_id: entity.id,
      })),
    )
    .flat();

  await findOrCreateRecords(models, { surveyResponse: responseRecords });
};

export const VALIDATION_RESPONSE_IDS = {
  [VALIDATION_SURVEY.id]: [
    'duplicate_quest_id1_test',
    'duplicate_quest_id2_test',
    'invalid_binary1_____test',
    'invalid_binary2_____test',
    'invalid_number1_____test',
    'invalid_number2_____test',
    'invalid_radio1______test',
    'invalid_radio2______test',
    'missing_id_column1__test',
    'missing_id_column2__test',
    'missing_quest_id1___test',
    'missing_quest_id2___test',
    'missing_response_id_test',
    'missing_type_col1___test',
    'missing_type_col2___test',
    'nonexist_quest_id1__test',
    'nonexist_quest_id2__test',
  ],
};

export const BASELINE_RESPONSE_IDS = {
  [CLINIC_DATA_SURVEY.id]: [
    'tcd_change_answer___test',
    'tcd_delete_answer___test',
    'tcd_delete_response_test',
    'tcd_basic___________test',
    'tcd_change_ans_tab__test',
    'tcd_update_dl1_a____test',
    'tcd_update_dl1_b____test',
    'tcd_update_dl5_a____test',
    'tcd_update_dl5_b____test',
    'tcd_merge_dl1_a_____test',
    'tcd_merge_dl1_b_____test',
    'tcd_merge_dl5_a_____test',
    'tcd_merge_dl5_b_____test',
  ],
  [FACILITY_FUNDAMENTALS_SURVEY.id]: ['tff_same_answers____test', 'tff_change_answer___test'],
};

export const PERIODIC_RESPONSE_IDS = {
  [YEARLY_SURVEY.id]: [
    '2020_dl1_untouched__test',
    '2020_dl1_update_____test',
    '2021_dl1_merge______test',
    '2020_dl5_override___test',
    '2021_dl5_merge______test',
    '2020_dl5_update_____test',
  ],
};

/**
 * Describes data changes from responseBaseline.xlsx to responseUpdates.xlsx
 */
export const RESPONSE_UPDATES = {
  answersChanged: [
    {
      // Radio
      surveyResponseId: 'tcd_change_answer___test',
      questionId: 'tcd_facility_open___test',
      newAnswer: 'Permanently Closed',
    },
    {
      // FreeText
      surveyResponseId: 'tcd_change_answer___test',
      questionId: 'tcd_major_damage____test',
      newAnswer: 'Testing',
    },
    {
      // Number
      surveyResponseId: 'tcd_change_answer___test',
      questionId: 'tcd_contact_number__test',
      newAnswer: '3000',
    },
    {
      // Binary
      surveyResponseId: 'tcd_change_answer___test',
      questionId: 'tcd_func_landline___test',
      newAnswer: 'Yes',
    },
    {
      // Another tab
      surveyResponseId: 'tff_change_answer___test',
      questionId: 'tff_other_names_____test',
      newAnswer: 'Thorno',
    },
  ],
  answerDeleted: {
    surveyResponseId: 'tcd_delete_answer___test',
    questionId: 'tcd_func_landline___test',
  },
  responsesAdded: [
    {
      entityCode: 'TEST_NR_1',
      date: '2017-06-28T01:40:00.000Z',
      answers: {
        tcd_facility_open___test: 'Fully Operational',
        tcd_contact_number__test: '1.5',
        tcd_func_landline___test: 'No',
      },
    },
    {
      entityCode: 'TEST_NR_2',
      date: '2017-06-28T02:37:00.000Z',
      answers: {
        tcd_facility_open___test: 'Fully Operational',
        tcd_contact_number__test: '0.4',
        tcd_func_landline___test: 'No',
      },
    },
  ],
};
