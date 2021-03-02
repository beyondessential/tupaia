/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import {
  getTestModels,
  getTestDatabase,
  clearTestData,
  AnalyticsRefresher,
  buildAndInsertSurveys,
  buildAndInsertSurveyResponses,
  findOrCreateDummyRecord,
} from '@tupaia/database';
import { ENTITIES, SURVEYS, SURVEY_RESPONSES } from './TupaiaDataApi.fixtures';
import { testFetchEvents } from './testFetchEvents';
import { testFetchAnalytics } from './testFetchAnalytics';
import { testFetchDataElements } from './testFetchDataElements';

describe('TupaiaDataApi', () => {
  const database = getTestDatabase();
  const models = getTestModels();
  const analyticsRefresher = new AnalyticsRefresher(database, models);

  beforeAll(async () => {
    jest.setTimeout(30000); // These tests seem to a take a little while to run, so set timeout to 30 seconds

    // start listening for changes
    analyticsRefresher.listenForChanges();

    await buildAndInsertSurveys(models, SURVEYS);
    await Promise.all(
      ENTITIES.map(e => findOrCreateDummyRecord(models.entity, { code: e.code }, e)),
    );
    await buildAndInsertSurveyResponses(models, SURVEY_RESPONSES);

    await models.database.waitForAllChangeHandlers();
  });

  afterAll(async () => {
    await clearTestData(models.database);
    await models.database.waitForAllChangeHandlers();
    analyticsRefresher.stopListeningForChanges();
    jest.setTimeout(5000); // Reset to default timeout
  });

  describe('fetchEvents()', testFetchEvents);

  describe('fetchAnalytics()', testFetchAnalytics);

  describe('fetchDataElements()', testFetchDataElements);
});
