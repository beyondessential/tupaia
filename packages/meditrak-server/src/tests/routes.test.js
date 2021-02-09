/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { testGetChangesCount, testPostChanges, testPutSurveyResponses } from './routeTests';

describe('Tupaia API', () => {
  describe('GET /changes/count', testGetChangesCount);

  describe('POST /changes', testPostChanges);

  describe('POST /surveyResponses', testPutSurveyResponses);
});
