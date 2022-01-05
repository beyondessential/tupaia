import { generateTestId } from '@tupaia/database';

/**
 * Note: this file includes data that are referenced or used in import spreadsheets
 */

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
      id: 'tff_facility_type___test',
      code: 'TFF_Facility_type',
      type: 'Radio',
      options: ['1', '2', '3'],
    },
    {
      id: 'tff_urban_rural_____test',
      code: 'TFF_Urban_rural',
      type: 'Radio',
      options: ['Urban', 'Rural'],
    },
    {
      id: 'tff_inpatient_fac___test',
      code: 'TFF_Inpatient_fac',
      type: 'Binary',
    },
    {
      id: 'tff_catchment_pop___test',
      code: 'TFF_Catchment_pop',
      type: 'Number',
    },
    {
      id: 'tff_catchment_acc___test',
      code: 'TFF_Catchment_acc',
      type: 'Radio',
      options: ['Estimate', 'Fairly Confident', 'Very confident'],
    },
    {
      id: 'tff_management______test',
      code: 'TFF_Management',
      type: 'Radio',
      options: ['Public (Government)', 'Church'],
    },
    {
      id: 'tff_main_supply_____test',
      code: 'TFF_Main_supply',
      type: 'FreeText',
    },
    {
      id: 'tff_facility_gps____test',
      code: 'TFF_Facility_gps',
      type: 'Geolocate',
    },
    {
      id: 'tff_photo___________test',
      code: 'TFF_Photo',
      type: 'Photo',
    },
    {
      id: 'tff_open_space_gps__test',
      code: 'TFF_Open_space_gps',
      type: 'Geolocate',
    },
  ],
};

export const VALIDATION_RESPONSE_IDS = [
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
];

export const CLINIC_DATA_RESPONSE_IDS = [
  'tcd_change_answer___test',
  'tcd_delete_answer___test',
  'tcd_delete_response_test',
  'tcd_basic___________test',
  'tcd_change_ans_tab__test',
];

export const FACILITY_FUNDAMENTALS_RESPONSE_IDS = [
  'tff_dl1_____________test',
  'tff_dl2_____________test',
  'tff_dl3_____________test',
  'tff_dl4_____________test',
  'tff_dl5_____________test',
  'tff_dl6_____________test',
  'tff_dl8_____________test',
  'tff_dl9_____________test',
  'tff_dl10____________test',
];

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
      surveyResponseId: 'tff_dl9_____________test',
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
