/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { testPermissions } from './testPermissions';
import { testFunctionality } from './testFunctionality';

describe('importSurveyResponses(): POST import/surveyResponses', () => {
  describe('Test permissions when importing survey responses', testPermissions);
  describe('Test functionality of importing survey responses', testFunctionality);
});
