import { AnalyticsRefresher } from '../changeHandlers';
import { buildAndInsertSurveyResponses } from '../../core/testUtilities/buildAndInsertSurveyResponses';
import { buildAndInsertSurveys } from '../../core/testUtilities/buildAndInsertSurveys';
import { findOrCreateRecords } from '../../core/testUtilities/upsertDummyRecord';

export const setupTest = async (models, { dbRecords = {}, surveys = [], surveyResponses = [] }) => {
  await findOrCreateRecords(models, dbRecords);
  await buildAndInsertSurveys(models, surveys);
  await buildAndInsertSurveyResponses(models, surveyResponses);
  await AnalyticsRefresher.refreshAnalytics(models.database);
};
