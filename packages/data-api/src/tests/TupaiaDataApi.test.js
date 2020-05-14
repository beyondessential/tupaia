/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import {
  ModelRegistry,
  getTestDatabase,
  buildAndInsertSurveys,
  buildAndInsertSurveyResponses,
  findOrCreateDummyRecord,
} from '@tupaia/database';
import { ENTITIES, SURVEYS, SURVEY_RESPONSES } from './TupaiaDataApi.fixtures';
import { testFetchEvents } from './testFetchEvents';

describe('TupaiaDataApi', () => {
  before(async () => {
    const models = new ModelRegistry(getTestDatabase());
    await buildAndInsertSurveys(models, SURVEYS);
    await Promise.all(
      ENTITIES.map(e => findOrCreateDummyRecord(models.entity, { code: e.code }, e)),
    );
    await buildAndInsertSurveyResponses(models, SURVEY_RESPONSES);
  });

  describe('fetchEvents()', testFetchEvents);

  describe('fetchAnalytics()', () => {
    // TODO add test cases
  });

  describe('fetchDataElements()', () => {
    // TODO add test cases
  });
});
