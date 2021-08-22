/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { buildAndInsertSurveyResponses } from './buildAndInsertSurveyResponses';
import { buildAndInsertSurveys } from './buildAndInsertSurveys';
import { findOrCreateRecords } from './upsertDummyRecord';
import { AnalyticsRefresher } from '..';

export const setupTest = async (models, { dbRecords = {}, surveys = [], surveyResponses = [] }) => {
  await findOrCreateRecords(models, dbRecords);
  await buildAndInsertSurveys(models, surveys);
  await buildAndInsertSurveyResponses(models, surveyResponses);
  await AnalyticsRefresher.refreshAnalytics(models.database);
};
