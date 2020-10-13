/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { TestableApp } from './TestableApp';
import { DummySyncQueue } from './DummySyncQueue';
import {
  testGetChangesCount,
  testPostChanges,
  testImportSurveyResponses,
  testPutSurveyResponses,
} from './routeTests';

describe('Tupaia API', () => {
  const app = new TestableApp();
  const { models } = app;

  // Set up dummy sync queue to ensure that functionality is working correctly
  const syncQueue = new DummySyncQueue();
  models.addChangeHandlerForCollection(models.surveyResponse.databaseType, syncQueue.add);
  models.addChangeHandlerForCollection(models.answer.databaseType, syncQueue.add);

  before(async () => {
    await app.authenticate();
  });

  describe('GET /changes/count', testGetChangesCount(app, models));

  describe('POST /changes', testPostChanges(app, models, syncQueue));

  describe('POST /surveyResponses', testPutSurveyResponses(app, models, syncQueue));

  describe('POST /import/surveyResponses', testImportSurveyResponses(app, models, syncQueue));
});
