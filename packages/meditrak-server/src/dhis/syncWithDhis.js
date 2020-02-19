/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 **/

import { DataBroker } from '@tupaia/data-broker';
import { ExternalApiSyncQueue } from '../externalApiSync/ExternalApiSyncQueue';
import { pushLatest } from './pushLatest';
import { DhisChangeValidator } from './DhisChangeValidator';
import { DhisChangeDetailGenerator } from './DhisChangeDetailGenerator';
import { DhisChangeSideEffectHandler } from './DhisChangeSideEffectHandler';

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
  const validator = new DhisChangeValidator(models);
  const detailGenerator = new DhisChangeDetailGenerator(models);
  const sideEffectHandler = new DhisChangeSideEffectHandler(models);
  const syncQueue = new ExternalApiSyncQueue(
    models,
    validator,
    subscriptions,
    detailGenerator,
    models.dhisSyncQueue,
    sideEffectHandler,
  );

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
