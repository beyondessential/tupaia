import { DataBroker } from '@tupaia/data-broker';
import winston from '../log';
import { createDhisSyncQueue } from './createDhisSyncQueue';
import { pushLatest } from './pushLatest';

// Push one change per 1000 ms, i.e. 60 per minute
const BATCH_SIZE = 1;
const PERIOD_BETWEEN_SYNCS = 1000; // 1 second between syncs

export async function startSyncWithDhis(models) {
  const syncQueue = createDhisSyncQueue(models);

  // Start recursive sync loop (enabled by default)
  if (process.env.DHIS_SYNC_DISABLE === 'true') {
    winston.info('DHIS2 sync is disabled');
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
