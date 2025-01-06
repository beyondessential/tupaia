/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { pushChange } from './pushChange';
import { getDhisApiInstanceForChange } from './api';

export async function pushLatest(models, syncQueue, dataBroker, batchSize) {
  // Get the latest changes for this aggregation server
  const latestChanges = await syncQueue.get(batchSize);
  const pushedChanges = [];
  for (let i = 0; i < latestChanges.length; i += 1) {
    const change = latestChanges[i];
    // Get appropriate aggregation server api, or create it if this is the first use
    const dhisApi = getDhisApiInstanceForChange(change);
    const successfullyPushed = await pushChange(models, change, dhisApi, dataBroker);
    // If it has synced to DHIS2, remove the change from the sync queue
    if (successfullyPushed) {
      await syncQueue.use(change);
    } else {
      await syncQueue.registerBadRequest(change);
      await syncQueue.deprioritise(change);
    }
  }

  return pushedChanges;
}
