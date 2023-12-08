/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { DummySyncQueue } from './DummySyncQueue';

export function setupDummySyncQueue(models) {
  // Set up dummy sync queue to ensure that functionality is working correctly
  const syncQueue = new DummySyncQueue();
  models.addChangeHandlerForCollection(models.surveyResponse.databaseType, syncQueue.add);
  models.addChangeHandlerForCollection(models.answer.databaseType, syncQueue.add);
  return syncQueue;
}
