/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { ModelRegistry, getTestDatabase } from '@tupaia/database';
import { SURVEYS, SURVEY_RESPONSES } from './TupaiaDataApi.fixtures';
import { testGetEvents } from './testGetEvents';

describe('TupaiaDataApi', () => {
  before(async () => {
    const models = new ModelRegistry(getTestDatabase());
    await upsertDummySurveys(SURVEYS);
  });

  describe('getEvents()', testGetEvents);

  describe('getAnalytics()', () => {
    // TODO add test cases
  });

  describe('fetchDataElements()', () => {
    // TODO add test cases
  });
});
