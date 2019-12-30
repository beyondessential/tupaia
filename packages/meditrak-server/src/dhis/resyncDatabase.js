/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { TYPES } from '../database';

const CURSOR_SETTINGS_KEY = 'dhisResyncCursor';
const BATCH_SIZE = 10; // Process 10 survey responses
const PERIOD = 1000; // With a 1 second wait in between

/**
 * Resyncs all survey responses and answers to DHIS2. Not attached to anything on the master branch
 * but is used occasionally by the scratchpad branch
 */
export async function resyncDatabase(database) {
  let lastSurveyResponseId = await database.getSetting(CURSOR_SETTINGS_KEY);

  if (!lastSurveyResponseId) {
    // First time through recursive function, clear current dhis sync queue
    await database.delete(TYPES.DHIS_SYNC_QUEUE);
  }

  // Cause an update to every survey response, to add them all to the sync queue
  const surveyResponses = await database.markAsChanged(
    TYPES.SURVEY_RESPONSE,
    lastSurveyResponseId ? { id: { comparator: '>', comparisonValue: lastSurveyResponseId } } : {},
    {
      sort: ['id'],
      limit: BATCH_SIZE,
    },
  );

  if (!surveyResponses || surveyResponses.length === 0) {
    // Reached the end of the responses, done
    await database.clearSetting(CURSOR_SETTINGS_KEY);
    return;
  }

  for (let responseIndex = 0; responseIndex < surveyResponses.length; responseIndex++) {
    const surveyResponse = surveyResponses[responseIndex];
    // Cause an update to every answer in this response, to add them all to the sync queue
    await database.markAsChanged(TYPES.ANSWER, {
      survey_response_id: surveyResponse.id,
    });
    lastSurveyResponseId = surveyResponse.id;
  }
  await database.setSetting(CURSOR_SETTINGS_KEY, lastSurveyResponseId);
  setTimeout(() => resyncDatabase(database), PERIOD);
}
