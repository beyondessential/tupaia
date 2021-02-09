/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { Authenticator } from '@tupaia/auth';
import { TestableApp } from './TestableApp';
import { DummySyncQueue } from './DummySyncQueue';
import {
  testGetChangesCount,
  testPostChanges,
  testImportSurveyResponses,
  testPutSurveyResponses,
} from './routeTests';
import { prepareStubAndAuthenticate } from './routes/utilities/prepareStubAndAuthenticate';
import { BES_ADMIN_PERMISSION_GROUP } from '../permissions';

describe('Tupaia API', () => {
  const app = new TestableApp();
  const { models } = app;

  // Set up dummy sync queue to ensure that functionality is working correctly
  const syncQueue = new DummySyncQueue();
  models.addChangeHandlerForCollection(models.surveyResponse.databaseType, syncQueue.add);
  models.addChangeHandlerForCollection(models.answer.databaseType, syncQueue.add);

  before(async () => {
    // We're not testing permissions here
    const policy = {
      DL: [BES_ADMIN_PERMISSION_GROUP],
    };
    await prepareStubAndAuthenticate(app, policy);
  });

  after(() => {
    Authenticator.prototype.getAccessPolicyForUser.restore();
  });

  describe('GET /changes/count', testGetChangesCount(app, models));

  describe('POST /changes', testPostChanges(app, models, syncQueue));

  describe('POST /surveyResponses', testPutSurveyResponses(app, models, syncQueue));

  describe('POST /import/surveyResponses', testImportSurveyResponses(app, models, syncQueue));
});
