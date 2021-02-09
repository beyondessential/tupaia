/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import { oneSecondSleep } from '@tupaia/utils';

import { TestableApp } from '../../TestableApp';
import { randomIntBetween, setupDummySyncQueue } from '../../testUtilities';

const getRandomSurveyResponse = async models => {
  const surveyResponses = await models.surveyResponse.all();
  return surveyResponses[randomIntBetween(0, surveyResponses.length - 1)];
};

const getRandomNewEntityForSurveyResponse = async (models, surveyResponse) => {
  const entities = await models.entity.find({
    id: {
      comparator: '!=',
      comparisonValue: surveyResponse.entity_id,
    },
  });

  return entities[randomIntBetween(0, entities.length - 1)].id;
};

export const testPutSurveyResponses = async () => {
  describe('Update entity for existing survey response', async function () {
    const app = new TestableApp();
    const { models } = app;
    let syncQueue;
    let surveyResponseId;
    let previousNumberOfSurveyResponses = 0;
    let previousNumberOfAnswers = 0;
    let response = {};
    let newEntityId;
    let numberOfAnswersInSurveyResponse;

    before(async function () {
      await app.grantFullAccess();
      syncQueue = setupDummySyncQueue(models);
      syncQueue.clear();
      previousNumberOfSurveyResponses = await models.surveyResponse.count();
      previousNumberOfAnswers = await models.answer.count();
      const surveyResponse = await getRandomSurveyResponse(models);
      newEntityId = await getRandomNewEntityForSurveyResponse(models, surveyResponse);

      surveyResponseId = surveyResponse.id;
      numberOfAnswersInSurveyResponse = await models.answer.count({
        survey_response_id: surveyResponseId,
      });
      response = await app.put(`surveyResponses/${surveyResponseId}`, {
        body: {
          entity_id: newEntityId,
        },
      });
    });

    after(function () {
      app.revokeAccess();
    });

    it('should respond with a successful http status', function () {
      expect(response.statusCode).to.equal(200);
    });

    it('should have the same number of survey responses', async function () {
      const postNumberOfSurveyResponses = await models.surveyResponse.count();
      expect(postNumberOfSurveyResponses).to.equal(previousNumberOfSurveyResponses);
    });

    it('should have the same number of answers', async function () {
      const postNumberOfAnswers = await models.answer.count();
      expect(postNumberOfAnswers).to.equal(previousNumberOfAnswers);
    });

    it('should have changed the entity associated with the survey response to the new entity', async function () {
      const surveyResponse = await models.surveyResponse.findById(surveyResponseId);
      expect(surveyResponse.entity_id).to.equal(newEntityId);
    });

    it('should add the survey response and all answers to the sync queue after it is submitted', async function () {
      this.retries(10);
      await oneSecondSleep(1000);
      expect(syncQueue.count(models.surveyResponse.databaseType)).to.equal(1);
      expect(syncQueue.count(models.answer.databaseType)).to.equal(numberOfAnswersInSurveyResponse);
    });
  });
};
