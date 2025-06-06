import { isEmpty } from 'lodash';

import { AnalyticsRefresher } from '../changeHandlers';
import { buildAndInsertSurveyResponses } from './buildAndInsertSurveyResponses';
import { buildAndInsertSurveys } from './buildAndInsertSurveys';
import { findOrCreateRecords } from './upsertDummyRecord';

export const setupTest = async (
  models,
  { dbRecords = {}, surveys = [], surveyResponses = [], currentSyncTickFact = {} },
) => {
  if (!isEmpty(currentSyncTickFact)) {
    await models.localSystemFact.updateOrCreate({ key: 'currentSyncTick' }, currentSyncTickFact);
  }
  await findOrCreateRecords(models, dbRecords);
  await buildAndInsertSurveys(models, surveys);
  await buildAndInsertSurveyResponses(models, surveyResponses);
  await AnalyticsRefresher.refreshAnalytics(models.database);
};
