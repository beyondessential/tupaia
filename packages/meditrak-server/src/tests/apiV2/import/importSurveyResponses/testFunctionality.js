/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import moment from 'moment';
import {
  findOrCreateDummyRecord,
  findOrCreateDummyCountryEntity,
  buildAndInsertSurveys,
} from '@tupaia/database';
import { oneSecondSleep } from '@tupaia/utils';
import {
  setupDummySyncQueue,
  TestableApp,
  upsertEntity,
  upsertQuestion,
} from '../../../testUtilities';
import { importFile } from './helpers';

function expectError(response, match) {
  const { body, statusCode } = response;
  expect(statusCode).to.equal(400);
  expect(body).to.have.property('error');
  expect(body.error).to.match(match);
}

export const testFunctionality = async () => {
  const app = new TestableApp();
  const { models } = app;
  const syncQueue = setupDummySyncQueue(models);

  const deletedSurveyResponseId = '1125f5e462d7a74a5a2_test';
  const changeAnswersResponseId = '69e05722883b0cb7f6d_test';
  // eslint-disable-next-line camelcase
  const changeAnswersResponse_OtherTabId = '21113eb873529ced62b_test';

  describe('Valid survey response format causes appropriate changes', () => {
    let numberAnswersToBeDeleted;

    const answersChanged = [
      {
        // Radio
        surveyResponseId: changeAnswersResponseId,
        questionId: 'faccc42a44705c02a7e_test',
        newAnswer: 'Permanently Closed',
      },
      {
        // FreeText
        surveyResponseId: changeAnswersResponseId,
        questionId: 'faccc42a44705c02b9e_test',
        newAnswer: 'Testing',
      },
      {
        // Number
        surveyResponseId: changeAnswersResponseId,
        questionId: 'faccc42a44705c02abc_test',
        newAnswer: '3000',
      },
      {
        // Another tab
        surveyResponseId: changeAnswersResponse_OtherTabId,
        questionId: 'fdfcc42a44705c032a8_test',
        newAnswer: 'Thorno',
      },
      {
        // Binary
        surveyResponseId: changeAnswersResponseId,
        questionId: 'faccc42a44705c02aa8_test',
        newAnswer: 'Yes',
      },
    ];

    const newResponseEntityId1 = 'f70fc6a0715dae51403_test';
    const newResponseEntityId2 = 'f70fc6a0715dae51412_test';
    const surveyResponsesAdded = [
      {
        entityId: newResponseEntityId1,
        date: new Date(Date.UTC(2017, 5, 28, 1, 40)), // Month is zero based in js
        answers: {
          faccc42a44705c02a7e_test: 'Fully Operational',
          faccc42a44705c02abc_test: '1.5',
          faccc42a44705c02aa8_test: 'No',
        },
      },
      {
        entityId: newResponseEntityId2,
        date: new Date(Date.UTC(2017, 5, 28, 2, 37)), // Month is zero based in js
        answers: {
          faccc42a44705c02a7e_test: 'Fully Operational',
          faccc42a44705c02abc_test: '0.4',
          faccc42a44705c02aa8_test: 'No',
        },
      },
    ];

    const answerDeleted = {
      surveyResponseId: '7497651f61f8b31fe4c_test',
      questionId: 'faccc42a44705c02aa8_test',
    };

    before(async () => {
      // Import the baseline data
      await app.grantFullAccess();

      const addQuestion = async (id, type, options) =>
        upsertQuestion({
          id,
          text: `Test question ${id}`,
          type,
          options: options && options.map(value => ({ value, label: value })),
        });

      await Promise.all([
        addQuestion('fdfcc42a44705c032a8_test', 'FreeText'),
        addQuestion('fdfcc42a44705c032b2_test', 'Radio', ['1', '2', '3']),
        addQuestion('fdfcc42a44705c032b8_test', 'Radio', ['Urban', 'Rural']),
        addQuestion('fdfcc42a44705c032bc_test', 'Binary'),
        addQuestion('fdfcc42a44705c032c2_test', 'Number'),
        addQuestion('fdfcc42a44705c032c8_test', 'Radio', [
          'Estimate',
          'Fairly Confident',
          'Very confident',
        ]),
        addQuestion('fdfcc42a44705c032cc_test', 'Radio', ['Public (Government)', 'Church']),
        addQuestion('fdfcc42a44705c032d2_test', 'FreeText'),
        addQuestion('fdfcc42a44705c032d6_test', 'Geolocate'),
        addQuestion('fdfcc42a44705c032dc_test', 'Photo'),
        addQuestion('fdfcc42a44705c032e2_test', 'Geolocate'),
        addQuestion('faccc42a44705c02a7e_test', 'Radio', [
          'Fully Operational',
          'Operational but closed this week',
          'Temporarily Closed',
          'Permanently Closed',
        ]),
        addQuestion('faccc42a44705c02aa8_test', 'Binary'),
        addQuestion('faccc42a44705c02ab2_test', 'FreeText'),
        addQuestion('faccc42a44705c02abc_test', 'Number'),
        addQuestion('faccc42a44705c02b9e_test', 'FreeText'),
      ]);

      const { country: demoLand } = await findOrCreateDummyCountryEntity(models, {
        code: 'DL',
        name: 'Demo Land',
      });
      await findOrCreateDummyRecord(models.entity, { code: 'DL_7', country_code: demoLand.code });
      await findOrCreateDummyRecord(models.entity, { code: 'DL_9', country_code: demoLand.code });
      await findOrCreateDummyRecord(models.entity, {
        code: 'DL_10',
        country_code: demoLand.code,
      });
      await findOrCreateDummyRecord(models.entity, {
        code: 'DL_11',
        country_code: demoLand.code,
      });
      const publicPermissionGroup = await findOrCreateDummyRecord(models.permissionGroup, {
        name: 'Public',
      });
      const [{ survey }] = await buildAndInsertSurveys(models, [
        {
          code: 'TEST_IMPORT_SURVEY_FOR_IMPORT_RESPONSES',
          name: 'Test Survey',
          permission_group_id: publicPermissionGroup.id,
        },
      ]);
      const surveyId = survey.id;

      const entityId = 'entity_000000000001_test';

      // entity that all edited responses should be against
      await upsertEntity({ id: entityId, code: entityId });

      // entities that new responses should be against
      await upsertEntity({ id: newResponseEntityId1, code: 'TEST_NR_1' });
      await upsertEntity({ id: newResponseEntityId2, code: 'TEST_NR_2' });

      const userId = 'user_00000000000000_test';
      await models.user.updateOrCreate(
        {
          id: userId,
        },
        {
          name: 'Test User',
          email: 'testuser@tupaia.org',
          password_hash: 'hash',
          password_salt: 'salt',
        },
      );

      const createSurveyResponse = id =>
        models.surveyResponse.updateOrCreate(
          {
            id,
          },
          {
            survey_id: surveyId,
            user_id: userId,
            entity_id: entityId,
            assessor_name: 'Test',
            start_time: new Date(),
            end_time: new Date(),
          },
        );

      await Promise.all(
        [
          // deletedSurveyResponseId,
          // changeAnswersResponseId,
          // changeAnswersResponse_OtherTabId,
          // basic
          '69e05722883b0cb7f6d_test',
          '7497651f61f8b31fe4c_test',
          '1125f5e462d7a74a5a2_test',
          '1b97651f61f8b31fc23_test',
          // fundamentals
          '26a13eb873529ced637_test',
          'd55cf522fc10934365e_test',
          '21c5da9b13a47409bd8_test',
          'e00f0199d53d86c865f_test',
          '18f13eb873529ced61c_test',
          '3e25f5e462d7a74a709_test',
          '80a5da9b13a47409d92_test',
          '46fa4d04aa4c57b79ce_test',
          '21113eb873529ced62b_test',
        ].map(createSurveyResponse),
      );

      await importFile(app, 'setup.xlsx');

      numberAnswersToBeDeleted =
        (await models.answer.count({ survey_response_id: deletedSurveyResponseId })) + 1; // We test deleting a whole response, plus one individually deleted answer
      await models.database.waitForAllChangeHandlers();
      await syncQueue.clear();
      const response = await importFile(app, 'valid.xlsx', [
        'Test Survey',
        'Facility Fundamentals',
      ]);
      expect(response.statusCode).to.equal(200);
    });

    after(() => {
      app.revokeAccess();
    });

    it('should change answer text', async () => {
      // Check all changed answers have been updated to reflect their new values
      for (const changedAnswer of answersChanged) {
        const answer = await models.answer.findOne({
          survey_response_id: changedAnswer.surveyResponseId,
          question_id: changedAnswer.questionId,
        });
        expect(answer.text, 'changed answer text').to.equal(changedAnswer.newAnswer);
      }
    });

    it('should add new survey responses', async () => {
      // Check all added survey responses and their answers now exist
      for (const addedResponse of surveyResponsesAdded) {
        const surveyResponse = await models.surveyResponse.findOne({
          entity_id: addedResponse.entityId,
          // Convert date to data_time format
          data_time: moment.utc(addedResponse.date).format('YYYY-MM-DD HH:mm:ss'),
        });
        expect(surveyResponse, 'added survey response').to.exist;
        for (const [questionId, answerValue] of Object.entries(addedResponse.answers)) {
          const answer = await models.answer.findOne({
            survey_response_id: surveyResponse.id,
            question_id: questionId,
          });
          expect(answer, `added answer ${answerValue} for ${questionId}`).to.exist;
          expect(answer.text, `added answer text ${answerValue} for ${questionId}`).to.equal(
            answerValue,
          );
        }
      }
    });

    it('should delete survey responses', async () => {
      // Check deleted survey responses and answers are no longer in the models
      const deletedSurveyResponse = await models.surveyResponse.findById(deletedSurveyResponseId);
      expect(deletedSurveyResponse, 'deleted survey response').to.not.exist;
      const answersDeletedWithSurveyResponse = await models.answer.find({
        survey_response_id: deletedSurveyResponseId,
      });
      expect(
        answersDeletedWithSurveyResponse.length,
        'answers deleted with survey response',
      ).to.equal(0);
    });

    it('should delete a single answer', async () => {
      const individuallyDeletedAnswer = await models.answer.findOne({
        survey_response_id: answerDeleted.surveyResponseId,
        question_id: answerDeleted.questionId,
      });
      expect(individuallyDeletedAnswer, 'individually deleted answer').to.not.exist;
    });

    it('should add changes to the sync queue', async () => {
      await oneSecondSleep();
      expect(
        syncQueue.count(models.surveyResponse.databaseType, 'delete'),
        'survey responses deleted',
      ).to.equal(1);
      expect(syncQueue.count(models.answer.databaseType, 'delete'), 'answers deleted').to.equal(
        numberAnswersToBeDeleted,
      );
      expect(
        syncQueue.count(models.surveyResponse.databaseType, 'update'),
        'survey responses updated',
      ).to.equal(surveyResponsesAdded.length);
      const numberAnswersChanged =
        answersChanged.length +
        surveyResponsesAdded.reduce(
          (sum, addedResponse) => sum + Object.entries(addedResponse.answers).length,
          0,
        );
      expect(syncQueue.count(models.answer.databaseType, 'update'), 'answers updated').to.equal(
        numberAnswersChanged,
      );
    });
  });

  describe('Invalid survey response formats causes error messages', () => {
    it('should respond with an error if there is a duplicate question id', async () => {
      const response = await importFile(app, 'duplicateQuestionId.xlsx');
      expectError(response, /not unique/);
    });

    it('should respond with an error if there is an invalid binary answer', async () => {
      const response = await importFile(app, 'invalidBinaryAnswer.xlsx');
      expectError(response, /not an accepted value/);
    });

    it('should respond with an error if there is an invalid number answer', async () => {
      const response = await importFile(app, 'invalidNumberAnswer.xlsx');
      expectError(response, /Should contain a number/);
    });

    it('should respond with an error if there is an invalid radio answer', async () => {
      const response = await importFile(app, 'invalidRadioAnswer.xlsx');
      expectError(response, /not an accepted value/);
    });

    it('should respond with an error if the header row is missing', async () => {
      const response = await importFile(app, 'missingHeaderRow.xlsx');
      expectError(
        response,
        /Each tab of the import file must have at least one previously submitted survey as the first entry/,
      );
    });

    it('should respond with an error if the id column is missing', async () => {
      const response = await importFile(app, 'missingIdColumn.xlsx');
      expectError(response, /Missing Id column/);
    });

    it('should respond with an error if a question id is missing', async () => {
      const response = await importFile(app, 'missingQuestionId.xlsx');
      expectError(response, /Should not be empty/);
    });

    it('should respond with an error if a response id is missing', async () => {
      const response = await importFile(app, 'missingResponseId.xlsx');
      expectError(
        response,
        /Each tab of the import file must have at least one previously submitted survey as the first entry/,
      );
    });

    it('should respond with an error if the type column is missing', async () => {
      const response = await importFile(app, 'missingTypeColumn.xlsx');
      expectError(response, /Missing Type column/);
    });

    it('should respond with an error if a question id does not match an existing question', async () => {
      const response = await importFile(app, 'nonExistentQuestionId.xlsx');
      expectError(response, /No question with id/);
    });
  });
};
