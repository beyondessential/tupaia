import { TestModelRegistry } from '../../types';
import { DummySyncQueue } from './DummySyncQueue';

export function setupDummySyncQueue(models: TestModelRegistry) {
  // Set up dummy sync queue to ensure that functionality is working correctly
  const syncQueue = new DummySyncQueue();
  models.addChangeHandlerForCollection(models.surveyResponse.databaseRecord, syncQueue.add);
  models.addChangeHandlerForCollection(models.answer.databaseRecord, syncQueue.add);
  return syncQueue;
}
