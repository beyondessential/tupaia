/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

/**
 * Note: this file includes data that are referenced or used in import spreadsheets
 */

import { findOrCreateRecords, generateId } from '@tupaia/database';
import { reduceToDictionary, upperFirst } from '@tupaia/utils';

const ID_LENGTH = 24;

export const VALIDATION_SURVEY = {
  id: generateId(),
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
  id: generateId(),
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
  ],
};

export const FACILITY_FUNDAMENTALS_SURVEY = {
  id: generateId(),
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
    {
      id: 'tff_assigned_user___test',
      code: 'TFF_Assigned_user',
      type: 'User',
    },
  ],
};

export const BASIC_SURVEY_A = {
  id: generateId(),
  code: 'Test_Basic_Survey_A',
  name: 'Test_Basic Survey A',
  questions: [
    {
      id: 'basic_survey_a_q1___test',
      code: 'basic_survey_a_q1',
      type: 'FreeText',
    },
    {
      id: 'basic_survey_a_q2___test',
      code: 'basic_survey_a_q2',
      type: 'FreeText',
    },
    {
      id: 'basic_survey_a_q3___test',
      code: 'basic_survey_a_q3',
      type: 'User',
      text: 'User assigned',
    },
  ],
};

export const BASIC_SURVEY_B = {
  id: generateId(),
  code: 'Test_Basic_Survey_B',
  name: 'Test_Basic Survey B',
  questions: [
    {
      id: 'basic_survey_b_q1___test',
      code: 'basic_survey_b_q1',
      type: 'FreeText',
    },
    {
      id: 'basic_survey_b_q2___test',
      code: 'basic_survey_b_q2',
      type: 'FreeText',
    },
  ],
};

export const createPeriodicSurvey = periodGranularity => ({
  id: generateId(),
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
export const WEEKLY_SURVEY = createPeriodicSurvey('weekly');

export const createSurveyResponses = async (models, responsesBySurvey) => {
  const user = await models.user.findOne();
  const entityCodes = Object.values(responsesBySurvey)
    .flat()
    .map(r => r.entityCode);
  const entities = await models.entity.find({ code: entityCodes });
  const surveys = await models.survey.find({ code: Object.keys(responsesBySurvey) });
  const entityCodeToId = reduceToDictionary(entities, 'code', 'id');
  const surveyCodeToId = reduceToDictionary(surveys, 'code', 'id');

  const responseRecords = Object.entries(responsesBySurvey)
    .map(([surveyCode, responses]) =>
      responses.map(({ id, entityCode }) => ({
        id,
        survey_id: surveyCodeToId[surveyCode],
        user_id: user.id,
        entity_id: entityCodeToId[entityCode],
      })),
    )
    .flat();

  await findOrCreateRecords(models, { surveyResponse: responseRecords });
};

export const NON_PERIODIC_RESPONSES_AFTER_UPDATES = {
  notAffected: [
    {
      id: 'tcd_basic___________test',
      surveyCode: CLINIC_DATA_SURVEY.code,
      entityCode: 'DL_1',
      date: '2019-01-01T14:00:00.000Z',
      answers: {
        tcd_facility_open___test: 'Fully Operational',
        tcd_func_landline___test: 'Yes',
        tcd_best_network____test: 'Telecom',
      },
    },
    {
      id: 'tcd_untouched_dl1___test',
      surveyCode: CLINIC_DATA_SURVEY.code,
      entityCode: 'DL_1',
      date: '2020-01-05T14:00:00.000Z',
      answers: {
        tcd_func_landline___test: 'No',
      },
    },
    {
      id: 'tcd_merge_dl1_a_____test',
      surveyCode: CLINIC_DATA_SURVEY.code,
      entityCode: 'DL_1',
      date: '2020-01-18T14:00:00.000Z',
      answers: {
        tcd_facility_open___test: 'Fully Operational',
        tcd_func_landline___test: 'Yes',
        tcd_best_network____test: 'Telecom',
      },
    },
    {
      id: 'tcd_merge_dl1_b_____test',
      surveyCode: CLINIC_DATA_SURVEY.code,
      entityCode: 'DL_1',
      date: '2020-06-08T14:00:00.000Z',
      answers: {
        tcd_best_network____test: 'Optus',
      },
    },
    {
      id: 'tcd_untouched_dl5___test',
      surveyCode: CLINIC_DATA_SURVEY.code,
      entityCode: 'DL_5',
      date: '2020-01-05T14:00:00.000Z',
      answers: {
        tcd_func_landline___test: 'No',
      },
    },
    {
      id: 'tcd_merge_dl5_a_____test',
      surveyCode: CLINIC_DATA_SURVEY.code,
      entityCode: 'DL_5',
      date: '2020-01-18T14:00:00.000Z',
      answers: {
        tcd_facility_open___test: 'Operational but closed this week',
        tcd_func_landline___test: 'No',
        tcd_best_network____test: 'Telstra',
      },
    },
    {
      id: 'tcd_merge_dl5_b_____test',
      surveyCode: CLINIC_DATA_SURVEY.code,
      entityCode: 'DL_5',
      date: '2020-06-08T14:00:00.000Z',
      answers: {
        tcd_func_landline___test: 'No',
        tcd_best_network____test: 'Other',
      },
    },
    {
      id: 'tff_same_answers____test',
      surveyCode: FACILITY_FUNDAMENTALS_SURVEY.code,
      entityCode: 'DL_1',
      date: '2020-06-10T14:00:00.000Z',
      answers: {
        tff_other_names_____test: 'FNQ',
        tff_catchment_pop___test: '7500',
        tff_assigned_user___test: 'test_user_id_1',
      },
    },
  ],
  deleted: [{ id: 'tcd_delete_response_test' }],
  updated: [
    {
      id: 'tcd_change_answer___test',
      surveyCode: CLINIC_DATA_SURVEY.code,
      entityCode: 'DL_7',
      date: '2019-03-10T14:00:00.000Z',
      answers: {
        tcd_facility_open___test: 'Permanently Closed',
        tcd_func_landline___test: 'Yes',
        tcd_best_network____test: 'Telecom',
        tcd_contact_number__test: '3000',
      },
    },
    {
      id: 'tcd_delete_answer___test',
      surveyCode: CLINIC_DATA_SURVEY.code,
      entityCode: 'DL_9',
      date: '2019-06-10T14:00:00.000Z',
      answers: {
        tcd_facility_open___test: 'Operational but closed this week',
        tcd_best_network____test: 'Optus',
        tcd_contact_number__test: '1234567',
      },
    },
    {
      id: 'tcd_update_dl1_a____test',
      surveyCode: CLINIC_DATA_SURVEY.code,
      entityCode: 'DL_1',
      date: '2020-01-15T14:00:00.000Z',
      answers: {
        tcd_facility_open___test: 'Fully Operational',
        tcd_func_landline___test: 'Yes',
        tcd_best_network____test: 'Telecom',
        tcd_contact_number__test: '12345',
      },
    },
    {
      id: 'tcd_update_dl1_b____test',
      surveyCode: CLINIC_DATA_SURVEY.code,
      entityCode: 'DL_1',
      date: '2020-06-05T14:00:00.000Z',
      answers: {
        tcd_func_landline___test: 'No',
        tcd_best_network____test: 'Optus',
      },
    },
    {
      id: 'tcd_update_dl5_a____test',
      surveyCode: CLINIC_DATA_SURVEY.code,
      entityCode: 'DL_5',
      date: '2020-01-17T15:30:00.000Z',
      answers: {
        tcd_facility_open___test: 'Operational but closed this week',
        tcd_func_landline___test: 'No',
        tcd_best_network____test: 'Telstra',
        tcd_contact_number__test: '6789',
      },
    },
    {
      id: 'tcd_update_dl5_b____test',
      surveyCode: CLINIC_DATA_SURVEY.code,
      entityCode: 'DL_5',
      date: '2020-06-07T09:00:00.000Z',
      answers: {
        tcd_func_landline___test: 'Yes',
        tcd_best_network____test: 'Other',
      },
    },
    {
      id: 'tff_change_answer___test',
      surveyCode: FACILITY_FUNDAMENTALS_SURVEY.code,
      entityCode: 'DL_9',
      date: '2020-06-15T14:00:00.000Z',
      answers: {
        tff_other_names_____test: 'Thorno',
        tff_catchment_pop___test: '8000',
        tff_assigned_user___test: 'test_user_id_2',
      },
    },
  ],
  created: [
    // NEW
    {
      surveyCode: CLINIC_DATA_SURVEY.code,
      entityCode: 'DL_1',
      date: '2019-09-01T14:30:00.000Z',
      answers: {
        tcd_facility_open___test: 'Fully Operational',
        tcd_func_landline___test: 'No',
        tcd_contact_number__test: '1.5',
      },
    },
    {
      surveyCode: CLINIC_DATA_SURVEY.code,
      entityCode: 'DL_5',
      date: '2019-09-15T06:15:00.000Z',
      answers: {
        tcd_facility_open___test: 'Fully Operational',
        tcd_func_landline___test: 'No',
        tcd_contact_number__test: '0.4',
      },
    },
    // UPDATE (when a matching report is not found, a new one is created)
    {
      surveyCode: CLINIC_DATA_SURVEY.code,
      entityCode: 'DL_1',
      date: '2016-12-31T14:00:00.000Z',
      answers: {
        tcd_func_landline___test: 'No',
        tcd_best_network____test: 'Did not find a report to update',
      },
    },
    // MERGE
    {
      surveyCode: CLINIC_DATA_SURVEY.code,
      entityCode: 'DL_1',
      date: '2020-01-20T15:00:00.000Z',
      answers: {
        tcd_facility_open___test: 'Fully Operational',
        tcd_func_landline___test: 'Yes',
        tcd_best_network____test: 'Telecom',
        tcd_contact_number__test: '12345',
      },
    },
    {
      surveyCode: CLINIC_DATA_SURVEY.code,
      entityCode: 'DL_1',
      date: '2020-06-10T15:00:00.000Z',
      answers: {
        tcd_func_landline___test: 'No',
        tcd_best_network____test: 'Optus',
      },
    },
    {
      surveyCode: CLINIC_DATA_SURVEY.code,
      entityCode: 'DL_5',
      date: '2020-01-20T15:00:00.000Z',
      answers: {
        tcd_facility_open___test: 'Operational but closed this week',
        tcd_func_landline___test: 'No',
        tcd_best_network____test: 'Telstra',
        tcd_contact_number__test: '6789',
      },
    },
    {
      surveyCode: CLINIC_DATA_SURVEY.code,
      entityCode: 'DL_5',
      date: '2020-06-10T15:00:00.000Z',
      answers: {
        tcd_func_landline___test: 'Yes',
        tcd_best_network____test: 'Other',
      },
    },
    {
      surveyCode: CLINIC_DATA_SURVEY.code,
      entityCode: 'DL_5',
      date: '2016-12-31T14:00:00.000Z',
      answers: {
        tcd_func_landline___test: 'Yes',
        tcd_best_network____test: 'Did not find a report to merge',
        tcd_contact_number__test: '5678',
      },
    },
  ],
};

export const PERIODIC_RESPONSES_AFTER_UPDATES = {
  notAffected: [
    // Yearly
    {
      id: '2020_dl1_untouched__test',
      surveyCode: YEARLY_SURVEY.code,
      entityCode: 'DL_1',
      date: '2020-01-15T14:00:00.000Z',
      answers: {
        yearly_bird_________test: '2020_dl1_bird_untouched',
        yearly_cat__________test: '2020_dl1_cat_untouched',
      },
    },
    {
      id: '2021_dl1_merge______test',
      surveyCode: YEARLY_SURVEY.code,
      entityCode: 'DL_1',
      date: '2021-01-15T14:00:00.000Z',
      answers: {
        yearly_bird_________test: '2021_dl1_bird_existing',
        yearly_dog__________test: '2021_dl1_dog_existing',
      },
    },
    {
      id: '2020_dl5_merge______test',
      surveyCode: YEARLY_SURVEY.code,
      entityCode: 'DL_5',
      date: '2020-06-15T14:00:00.000Z',
      answers: {
        yearly_cat__________test: '2020_dl5_cat_existing',
      },
    },

    // Weekly
    {
      id: '2020W2_dl1_untouch__test',
      surveyCode: WEEKLY_SURVEY.code,
      entityCode: 'DL_1',
      date: '2020-01-06T14:00:00.000Z',
      answers: {
        weekly_bird_________test: '2020W2_dl1_bird_untouched',
        weekly_cat__________test: '2020W2_dl1_cat_untouched',
      },
    },
    {
      id: '2020W3_dl1_merge____test',
      surveyCode: WEEKLY_SURVEY.code,
      entityCode: 'DL_1',
      date: '2020-01-13T14:00:00.000Z',
      answers: {
        weekly_bird_________test: '2020W3_dl1_bird_existing',
        weekly_dog__________test: '2020W3_dl1_dog_existing',
      },
    },
    {
      id: '2020W2_dl5_merge____test',
      surveyCode: WEEKLY_SURVEY.code,
      entityCode: 'DL_5',
      date: '2020-01-10T14:00:00.000Z',
      answers: {
        weekly_cat__________test: '2020W2_dl5_cat_existing',
      },
    },
  ],
  deleted: [
    // Yearly
    {
      id: '2017_dl1_delete_____test',
    },

    // Weekly
    { id: '2017W1_dl1_delete___test' },
  ],
  updated: [
    // Yearly
    {
      id: '2020_dl1_update_____test',
      surveyCode: YEARLY_SURVEY.code,
      entityCode: 'DL_1',
      date: '2020-02-20T16:00:00.000Z',
      answers: {
        yearly_bird_________test: '2020_dl1_bird_new',
        yearly_cat__________test: '2020_dl1_cat_existing',
        yearly_dog__________test: '2020_dl1_dog_new',
      },
    },
    {
      id: '2020_dl5_override___test',
      surveyCode: YEARLY_SURVEY.code,
      entityCode: 'DL_5',
      date: '2020-03-16T15:00:00.000Z',
      answers: {
        yearly_bird_________test: '2020_dl5_bird_override_new',
        yearly_dog__________test: '2020_dl5_dog_override_new',
      },
    },
    {
      id: '2021_dl5_update_____test',
      surveyCode: YEARLY_SURVEY.code,
      entityCode: 'DL_5',
      date: '2021-09-05T11:00:00.000Z',
      answers: {
        yearly_bird_________test: '2021_dl5_bird_new',
        yearly_cat__________test: '2021_dl5_cat_new',
      },
    },

    // Weekly
    {
      id: '2020W2_dl1_update___test',
      surveyCode: WEEKLY_SURVEY.code,
      entityCode: 'DL_1',
      date: '2020-01-12T16:00:00.000Z',
      answers: {
        weekly_bird_________test: '2020W2_dl1_bird_new',
        weekly_cat__________test: '2020W2_dl1_cat_existing',
        weekly_dog__________test: '2020W2_dl1_dog_new',
      },
    },
    {
      id: '2020W2_dl5_override_test',
      surveyCode: WEEKLY_SURVEY.code,
      entityCode: 'DL_5',
      date: '2020-01-09T15:00:00.000Z',
      answers: {
        weekly_bird_________test: '2020W2_dl5_bird_override_new',
        weekly_dog__________test: '2020W2_dl5_dog_override_new',
      },
    },
    {
      id: '2020W3_dl5_update___test',
      surveyCode: WEEKLY_SURVEY.code,
      entityCode: 'DL_5',
      date: '2020-01-19T11:00:00.000Z',
      answers: {
        weekly_bird_________test: '2020W3_dl5_bird_new',
        weekly_cat__________test: '2020W3_dl5_cat_new',
      },
    },
  ],
  created: [
    // Yearly
    // UPDATE (when a matching report is not found, a new one is created)
    {
      surveyCode: YEARLY_SURVEY.code,
      entityCode: 'DL_1',
      date: '2016-12-31T14:00:00.000Z',
      answers: {
        yearly_bird_________test: '2016_dl1_bird_no_report_to_update',
      },
    },
    // MERGE
    {
      surveyCode: YEARLY_SURVEY.code,
      entityCode: 'DL_1',
      date: '2021-03-25T14:00:00.000Z',
      answers: {
        yearly_bird_________test: '2021_dl1_bird_existing',
        yearly_cat__________test: '2021_dl1_cat_new',
        yearly_dog__________test: '2021_dl1_dog_existing',
      },
    },
    {
      surveyCode: YEARLY_SURVEY.code,
      entityCode: 'DL_5',
      date: '2020-01-05T14:00:00.000Z',
      answers: {
        yearly_bird_________test: '2020_dl5_bird_new',
        yearly_cat__________test: '2020_dl5_cat_new',
      },
    },
    {
      surveyCode: YEARLY_SURVEY.code,
      entityCode: 'DL_5',
      date: '2016-12-31T14:00:00.000Z',
      answers: {
        yearly_bird_________test: '2016_d5_bird_no_report_to_merge',
      },
    },

    // Monthly
    // UPDATE (when a matching report is not found, a new one is created)
    {
      surveyCode: WEEKLY_SURVEY.code,
      entityCode: 'DL_1',
      date: '2016-12-26T14:00:00.000Z',
      answers: {
        weekly_bird_________test: '2016W52_dl1_bird_no_report_to_update',
      },
    },
    // MERGE
    {
      surveyCode: WEEKLY_SURVEY.code,
      entityCode: 'DL_1',
      date: '2020-01-18T14:00:00.000Z',
      answers: {
        weekly_bird_________test: '2020W3_dl1_bird_existing',
        weekly_cat__________test: '2020W3_dl1_cat_new',
        weekly_dog__________test: '2020W3_dl1_dog_existing',
      },
    },
    {
      surveyCode: WEEKLY_SURVEY.code,
      entityCode: 'DL_5',
      date: '2020-01-06T14:00:00.000Z',
      answers: {
        weekly_bird_________test: '2020W2_dl5_bird_new',
        weekly_cat__________test: '2020W2_dl5_cat_new',
      },
    },
    {
      surveyCode: WEEKLY_SURVEY.code,
      entityCode: 'DL_5',
      date: '2016-12-26T14:00:00.000Z',
      answers: {
        weekly_bird_________test: '2016W52_d5_bird_no_report_to_merge',
      },
    },
  ],
};
