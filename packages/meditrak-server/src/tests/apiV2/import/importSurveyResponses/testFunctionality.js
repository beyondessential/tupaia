/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import moment from 'moment';

import {
  buildAndInsertSurveys,
  findOrCreateDummyCountryEntity,
  findOrCreateRecords,
} from '@tupaia/database';
import { oneSecondSleep } from '@tupaia/utils';
import { resetTestData, setupDummySyncQueue, TestableApp } from '../../../testUtilities';
import { importFile } from './helpers';
import {
  BASELINE_RESPONSE_IDS,
  createSurveyResponses,
  PERIODIC_RESPONSE_IDS,
  CLINIC_DATA_SURVEY,
  DAILY_SURVEY,
  FACILITY_FUNDAMENTALS_SURVEY,
  MONTHLY_SURVEY,
  QUARTERLY_SURVEY,
  RESPONSE_UPDATES,
  WEEKLY_SURVEY,
  YEARLY_SURVEY,
} from './importSurveyResponses.fixtures';

export const testFunctionality = async () => {
  const app = new TestableApp();
  const { models } = app;

  before(async () => {
    await app.grantFullAccess();

    await findOrCreateDummyCountryEntity(models, { code: 'DL', name: 'Demo Land' });
    await findOrCreateRecords(models, {
      entity: [
        'DL1',
        'DL5',
        'DL_7',
        'DL_9',
        'DL_10',
        'DL_11',
        'TEST_NR_1',
        'TEST_NR_2',
      ].map(code => ({ code, country_code: 'DL' })),
    });
  });

  after(async () => {
    await resetTestData(models.database);
    app.revokeAccess();
  });

  describe('non periodic surveys', () => {
    const syncQueue = setupDummySyncQueue(models);
    let answersToBeDeletedCount;

    before(async () => {
      await buildAndInsertSurveys(models, [CLINIC_DATA_SURVEY, FACILITY_FUNDAMENTALS_SURVEY]);
      await createSurveyResponses(models, BASELINE_RESPONSE_IDS);

      const baselineResponse = await importFile(app, 'responseBaseline.xlsx');
      expect(baselineResponse.statusCode).to.equal(200);

      // We test deleting a whole response, plus one individually deleted answer
      answersToBeDeletedCount =
        (await models.answer.count({ survey_response_id: 'tcd_delete_response_test' })) + 1;
      await models.database.waitForAllChangeHandlers();
      await syncQueue.clear();

      const updatedResponse = await importFile(app, 'responseUpdates.xlsx', [
        'Test Clinic Data',
        'Test Facility Fundamentals',
      ]);
      expect(updatedResponse.statusCode).to.equal(200);
    });

    it('changes answer text', async () => {
      // Check all changed answers have been updated to reflect their new values
      for (const changedAnswer of RESPONSE_UPDATES.answersChanged) {
        const answer = await models.answer.findOne({
          survey_response_id: changedAnswer.surveyResponseId,
          question_id: changedAnswer.questionId,
        });
        expect(answer.text).to.equal(changedAnswer.newAnswer);
      }
    });

    it('adds new survey responses', async () => {
      // Check all added survey responses and their answers now exist
      for (const addedResponse of RESPONSE_UPDATES.responsesAdded) {
        const entity = await models.entity.findOne({ code: addedResponse.entityCode });
        const surveyResponse = await models.surveyResponse.findOne({
          entity_id: entity.id,
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

    it('deletes survey responses', async () => {
      // Check deleted survey responses and answers are no longer in the models
      const deletedSurveyResponse = await models.surveyResponse.findById(
        'tcd_delete_response_test',
      );
      expect(deletedSurveyResponse).to.not.exist;
      const answersDeletedWithSurveyResponse = await models.answer.find({
        survey_response_id: 'tcd_delete_response_test',
      });
      expect(answersDeletedWithSurveyResponse.length).to.equal(0);
    });

    it('deletes a single answer', async () => {
      const individuallyDeletedAnswer = await models.answer.findOne({
        survey_response_id: RESPONSE_UPDATES.answerDeleted.surveyResponseId,
        question_id: RESPONSE_UPDATES.answerDeleted.questionId,
      });
      expect(individuallyDeletedAnswer).to.not.exist;
    });

    it('adds changes to the sync queue', async () => {
      await oneSecondSleep();

      expect(syncQueue.count(models.surveyResponse.databaseType, 'delete')).to.equal(1);
      expect(syncQueue.count(models.answer.databaseType, 'delete')).to.equal(
        answersToBeDeletedCount,
      );
      expect(syncQueue.count(models.surveyResponse.databaseType, 'update')).to.equal(
        RESPONSE_UPDATES.responsesAdded.length,
      );

      const changedAnswerCount =
        RESPONSE_UPDATES.answersChanged.length +
        RESPONSE_UPDATES.responsesAdded.map(r => Object.values(r.answers)).flat().length;

      expect(syncQueue.count(models.answer.databaseType, 'update'), 'answers updated').to.equal(
        changedAnswerCount,
      );
    });
  });

  describe('periodic surveys', () => {
    before(async () => {
      await buildAndInsertSurveys(models, [
        YEARLY_SURVEY,
        QUARTERLY_SURVEY,
        MONTHLY_SURVEY,
        WEEKLY_SURVEY,
        DAILY_SURVEY,
      ]);
      await createSurveyResponses(models, PERIODIC_RESPONSE_IDS);

      const baselineResponse = await importFile(app, 'responsePeriodicBaseline.xlsx');
      expect(baselineResponse.statusCode).to.equal(200);

      const updatedResponse = await importFile(app, 'responsePeriodicUpdates.xlsx', [
        'Test Yearly',
      ]);
      expect(updatedResponse.statusCode).to.equal(200);
    });
  });
};
