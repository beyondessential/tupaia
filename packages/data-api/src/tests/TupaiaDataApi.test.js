/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import {
  getTestModels,
  buildAndInsertSurveys,
  buildAndInsertSurveyResponses,
  findOrCreateDummyRecord,
} from '@tupaia/database';
import { ENTITIES, SURVEYS, SURVEY_RESPONSES } from './TupaiaDataApi.fixtures';
import { testFetchEvents } from './testFetchEvents';
import { testFetchAnalytics } from './testFetchAnalytics';
import { testFetchDataElements } from './testFetchDataElements';

describe('TupaiaDataApi', () => {
  before(async () => {
    const models = getTestModels();
    await buildAndInsertSurveys(models, SURVEYS);
    await Promise.all(
      ENTITIES.map(e => findOrCreateDummyRecord(models.entity, { code: e.code }, e)),
    );
    await buildAndInsertSurveyResponses(models, SURVEY_RESPONSES);
  });

  describe('fetchEvents()', testFetchEvents);

  describe('fetchAnalytics()', testFetchAnalytics);

  describe('fetchDataElements()', testFetchDataElements);
});
