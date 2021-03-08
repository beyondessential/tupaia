/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { buildAndInsertSurveyResponses } from './buildAndInsertSurveyResponses';
import { buildAndInsertSurveys } from './buildAndInsertSurveys';
import { findOrCreateRecords } from './upsertDummyRecord';

export const setupTest = async (models, setup) => {
  const { dbRecords = [], surveys = [], surveyResponses = [] } = setup;
  await findOrCreateRecords(models, dbRecords);
  await buildAndInsertSurveys(models, surveys);
  await buildAndInsertSurveyResponses(models, surveyResponses);
};
