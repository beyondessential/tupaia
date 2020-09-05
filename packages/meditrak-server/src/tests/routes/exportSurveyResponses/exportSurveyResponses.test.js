/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';

import sinon from 'sinon';
import xlsx from 'xlsx';
import moment from 'moment';
import momentTimezone from 'moment-timezone';

import { buildAndInsertSurveys } from '@tupaia/database';
import { TestableApp } from '../../TestableApp';
import { upsertEntity } from '../../testUtilities';
import {
  INFO_ROW_HEADERS,
  INFO_COLUMN_HEADERS,
  EXPORT_DATE_FORMAT,
} from '../../../routes/exportSurveyResponses';

const SURVEY_RESPONSE_ID_ROW_INDEX = 0;
const ENTITY_CODE_ROW_INDEX = 1;
const ENTITY_NAME_ROW_INDEX = 2;
const SURVEY_RESPONSE_DATE_ROW_INDEX = 3;

const ENTITY_ID = 'entity_000000000001_test';
const ENTITY_NAME = 'Test Entity';

const USER_ID = 'user_00000000000000_test';

const getFieldFromRowIndex = rowIndex => {
  switch (rowIndex) {
    case SURVEY_RESPONSE_ID_ROW_INDEX:
      return 'surveyResponseId';
    case ENTITY_CODE_ROW_INDEX:
      return 'entityCode';
    case ENTITY_NAME_ROW_INDEX:
      return 'entityName';
    case SURVEY_RESPONSE_DATE_ROW_INDEX:
      return 'submissionDateWithTimezone';
    default:
      return 'answerText';
  }
};

const findMatchedSurveyResponse = (rowIndex, value) => {
  const field = getFieldFromRowIndex(rowIndex);

  if (field === 'answerText') {
    return surveyResponses.find(s => {
      const answerTexts = Object.values(s.answers).map(answer => answer.answerText);
      return answerTexts.includes(value);
    });
  }

  return surveyResponses.find(s => s[field] === value);
};

const questions = [
  {
    id: 'fdfcc42a44705c032a8_test',
    code: 'fdfcc42a44705c032a8_code',
    text: 'Test question fdfcc42a44705c032a8_code',
    type: 'FreeText',
  },
  {
    id: 'fdfcc42a44705c032bc_test',
    code: 'fdfcc42a44705c032bc_code',
    text: 'Test question fdfcc42a44705c032bc_code',
    type: 'FreeText',
  },
  {
    id: 'fdfcc42a44705c032c2_test',
    code: 'fdfcc42a44705c032c2_code',
    text: 'Test question fdfcc42a44705c032c2_code',
    type: 'Number',
  },
];

const surveyResponses = [
  {
    surveyResponseId: '26a13eb873529ced637_test',
    answers: {
      fdfcc42a44705c032a8_test: {
        answerText: 'Answer Test 1',
        answerType: 'FreeText',
      },
      fdfcc42a44705c032bc_test: {
        answerText: 'Answer Test 2',
        answerType: 'FreeText',
      },
      fdfcc42a44705c032c2_test: {
        answerText: '1111',
        answerType: 'Number',
      },
    },
    submissionDate: moment('2019-08-09 00:00:00+10'),
    submissionDateWithTimezone: momentTimezone('2019-08-09 00:00:00+10')
      .tz('Pacific/Auckland')
      .format(EXPORT_DATE_FORMAT),
    entityId: ENTITY_ID,
    entityCode: ENTITY_ID,
    entityName: ENTITY_NAME,
  },
  {
    surveyResponseId: 'd55cf522fc10934365e_test',
    answers: {
      fdfcc42a44705c032a8_test: {
        answerText: 'Answer Test 3',
        answerType: 'FreeText',
      },
      fdfcc42a44705c032bc_test: {
        answerText: 'Answer Test 4',
        answerType: 'FreeText',
      },
      fdfcc42a44705c032c2_test: {
        answerText: '222',
        answerType: 'Number',
      },
    },
    submissionDate: moment('2019-09-09 00:00:00+10'),
    submissionDateWithTimezone: momentTimezone('2019-09-09 00:00:00+10')
      .tz('Pacific/Auckland')
      .format(EXPORT_DATE_FORMAT),
    entityId: ENTITY_ID,
    entityCode: ENTITY_ID,
    entityName: ENTITY_NAME,
  },
  {
    surveyResponseId: '21c5da9b13a47409bd8_test',
    answers: {
      fdfcc42a44705c032a8_test: {
        answerText: 'Answer Test 5',
        answerType: 'FreeText',
      },
      fdfcc42a44705c032bc_test: {
        answerText: 'Answer Test 6',
        answerType: 'FreeText',
      },
      fdfcc42a44705c032c2_test: {
        answerText: '3333',
        answerType: 'Number',
      },
    },
    submissionDate: moment('2019-10-09 00:00:00+10'),
    submissionDateWithTimezone: momentTimezone('2019-10-09 00:00:00+10')
      .tz('Pacific/Auckland')
      .format(EXPORT_DATE_FORMAT),
    entityId: ENTITY_ID,
    entityCode: ENTITY_ID,
    entityName: ENTITY_NAME,
  },
];

describe('GET export/surveyResponses: Valid survey with appropriate survey responses', () => {
  const createDummyData = async models => {
    //Create Dummy Test Survey
    const permissionGroup = await models.permissionGroup.findOne({ name: 'Public' });
    const [{ survey }] = await buildAndInsertSurveys(models, [
      { code: 'TEST_SURVEY', permission_group_id: permissionGroup.id },
    ]);
    const surveyId = survey.id;

    // Create Dummy Questions/SurveyResponses/Answers
    const addQuestion = ({ id, code, text, type }) =>
      models.question.updateOrCreate(
        {
          id,
        },
        {
          code,
          text,
          type,
        },
      );

    const createSurveyResponse = async ({
      surveyResponseId,
      answers,
      submissionDate,
      entityId,
    }) => {
      await models.surveyResponse.updateOrCreate(
        {
          id: surveyResponseId,
        },
        {
          survey_id: surveyId,
          user_id: USER_ID,
          entity_id: entityId,
          assessor_name: 'Test',
          start_time: new Date(),
          end_time: new Date(),
          submission_time: submissionDate,
        },
      );

      await Promise.all(
        Object.entries(answers).map(([questionId, { answerText, answerType }]) =>
          models.answer.updateOrCreate(
            {
              id: `${surveyResponseId}_${questionId}`,
            },
            {
              survey_response_id: surveyResponseId,
              question_id: questionId,
              type: answerType,
              text: answerText,
            },
          ),
        ),
      );
    };

    // Create dummy entity
    await upsertEntity({ id: ENTITY_ID, code: ENTITY_ID, name: ENTITY_NAME });

    //Create dummy users
    await models.user.updateOrCreate(
      {
        id: USER_ID,
      },
      {
        name: 'Test User',
        email: 'testuser@tupaia.org',
        password_hash: 'hash',
        password_salt: 'salt',
      },
    );

    await Promise.all(questions.map(addQuestion));
    await Promise.all(surveyResponses.map(createSurveyResponse));
    await models.database.waitForAllChangeHandlers();
  };

  const app = new TestableApp();
  const models = app.models;

  before(async function() {
    sinon.stub(xlsx.utils, 'aoa_to_sheet');
    app.authenticate();
    await createDummyData(models);
  });

  after(function() {
    xlsx.utils.aoa_to_sheet.restore();
  });

  const getExportRows = async () => {
    const surveyCodes = 'TEST_SURVEY';
    const countryCode = 'DL';
    await app.get(`export/surveyResponses?surveyCodes=${surveyCodes}&countryCode=${countryCode}`);

    return xlsx.utils.aoa_to_sheet.getCall(0).args[0];
  };

  const checkMatchedField = async rowIndex => {
    const exportRows = await getExportRows();

    for (
      let colIndex = INFO_COLUMN_HEADERS.length;
      colIndex < exportRows[rowIndex].length;
      colIndex++
    ) {
      const cell = exportRows[rowIndex][colIndex];
      const matchedSurveyResponse = findMatchedSurveyResponse(rowIndex, cell);

      expect(matchedSurveyResponse).to.exist;
    }
  };

  it('Should have matched surveyResponseId when exporting', async function() {
    await checkMatchedField(SURVEY_RESPONSE_ID_ROW_INDEX);
  });

  it('Should have matched entity code when exporting', async function() {
    await checkMatchedField(ENTITY_CODE_ROW_INDEX);
  });

  it('Should have matched entity name when exporting', async function() {
    await checkMatchedField(ENTITY_NAME_ROW_INDEX);
  });

  it('Should have matched submissionDate when exporting', async function() {
    await checkMatchedField(SURVEY_RESPONSE_DATE_ROW_INDEX);
  });

  it('Should have matched answers when exporting', async function() {
    const exportRows = await getExportRows();

    //From INFO_ROW_HEADERS to further, they are answers rows
    for (let rowIndex = INFO_ROW_HEADERS.length; rowIndex < exportRows.length; rowIndex++) {
      for (
        let colIndex = INFO_COLUMN_HEADERS.length;
        colIndex < exportRows[rowIndex].length;
        colIndex++
      ) {
        const cell = exportRows[rowIndex][colIndex];
        const matchedSurveyResponse = findMatchedSurveyResponse(rowIndex, cell);

        expect(matchedSurveyResponse).to.exist;
      }
    }
  });
});
