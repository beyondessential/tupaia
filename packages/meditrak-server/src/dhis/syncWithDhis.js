/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 **/

import { DataBroker } from '@tupaia/data-broker';
import { ExternalApiSyncQueue } from '../database/ExternalApiSyncQueue';
import { ChangeDetailGenerator } from './syncQueue';
import { pushLatest } from './pushLatest';
import { ChangeValidator } from './ChangeValidator';

// Push one change per 1000 ms, i.e. 60 per minute
const BATCH_SIZE = 1;
const PERIOD_BETWEEN_SYNCS = 1000; // 1 second between syncs

export async function startSyncWithDhis(models) {
  // Syncs changes to DHIS2 aggregation servers
  const subscriptions = [
    models.surveyResponse.databaseType,
    models.answer.databaseType,
    models.entity.databaseType,
  ];
  const validator = new ChangeValidator(models);
  const detailGenerator = new ChangeDetailGenerator(models);
  const syncQueue = new ExternalApiSyncQueue(
    models,
    validator,
    subscriptions,
    detailGenerator.generateDetails,
    models.dhisSyncQueue,
  );

  // If an answer for an event based survey response is updated, mark its parent survey response as
  // having changed so that it syncs/resyncs along with its current answers
  models.addChangeHandlerForCollection(models.answer.databaseType, async change => {
    const answer = await models.answer.findById(change.record_id);
    const surveyResponse = await models.surveyResponse.findById(answer.survey_response_id);
    if (!surveyResponse) {
      // return early if the survey response has been deleted, as that delete will be on the sync
      // queue separately, and account for this change to an answer (which is presumably a delete!)
      return;
    }
    const isEventBased = await surveyResponse.isEventBased();
    if (isEventBased) {
      await models.surveyResponse.markAsChanged({ id: surveyResponse.id });
    }
  });

  // Start recursive sync loop (enabled by default)
  if (process.env.DHIS_SYNC_DISABLE === 'true') {
    console.log('DHIS2 sync is disabled');
  } else {
    const dataBroker = new DataBroker();
    syncWithDhis(models, syncQueue, dataBroker);
  }
}

async function syncWithDhis(models, syncQueue, dataBroker) {
  try {
    await pushLatest(models, syncQueue, dataBroker, BATCH_SIZE); // Push the next most recent batch of survey responses
  } finally {
    setTimeout(() => syncWithDhis(models, syncQueue, dataBroker), PERIOD_BETWEEN_SYNCS);
  }
}
