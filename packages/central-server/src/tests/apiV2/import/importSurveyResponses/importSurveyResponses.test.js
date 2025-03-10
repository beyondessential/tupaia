import { testPermissions } from './testPermissions';
import { testFunctionality } from './testFunctionality';
import { testOutdatedStatusUpdate } from './testOutdatedStatusUpdate';
import { testValidation } from './testValidation';
import { testGeneral } from './testGeneral';

describe('importSurveyResponses(): POST import/surveyResponses', () => {
  describe('Test permissions when importing survey responses', testPermissions);

  describe('Test import validation', testValidation);

  describe('Test general functionality', testGeneral);

  describe('Test functionality of importing survey responses', testFunctionality);

  describe('Test outdated status update', testOutdatedStatusUpdate);
});
