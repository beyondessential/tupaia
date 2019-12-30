/**
 * Tupaia MediTrak
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

export {
  clearTestData,
  generateDummyRecord,
  insertEntityAndFacility,
  insertSurveyAndScreens,
  insertSurveyResponse,
  populateTestData,
  resetTestData,
  upsertAnswer,
  upsertEntity,
  upsertQuestion,
  upsertSurvey,
  upsertSurveyResponse,
  upsertSurveyScreen,
  upsertSurveyScreenComponent,
} from './database';
export {
  generateTestId,
  randomEmail,
  randomIntBetween,
  randomString,
  generateValueOfType,
} from './random';
export { oneSecondSleep, sleep } from './sleep';
