/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { testPermissions } from './testPermissions';
import { testFunctionality } from './testFunctionality';
import { testOutdatedStatusUpdate } from './testOutdatedStatusUpdate';

describe('importSurveyResponses(): POST import/surveyResponses', () => {
  describe('Test permissions when importing survey responses', testPermissions);

  describe('Test functionality of importing survey responses', testFunctionality);

  describe('Test outdated status update', testOutdatedStatusUpdate);
});
