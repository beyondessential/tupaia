import { ExternalApiSyncQueue } from '../externalApiSync/ExternalApiSyncQueue';
import { DhisChangeValidator } from './DhisChangeValidator';
import { DhisChangeDetailGenerator } from './DhisChangeDetailGenerator';
import { DhisChangeSideEffectHandler } from './DhisChangeSideEffectHandler';

const SYNC_QUEUE_KEY = 'dhisSyncQueue';

export function createDhisSyncQueue(models) {
  // Syncs changes to DHIS2 aggregation servers
  const subscriptions = [
    models.surveyResponse.databaseRecord,
    models.answer.databaseRecord,
    models.entity.databaseRecord,
  ];
  const validator = new DhisChangeValidator(models);
  const detailGenerator = new DhisChangeDetailGenerator(models);
  const sideEffectHandler = new DhisChangeSideEffectHandler(models);
  return new ExternalApiSyncQueue(
    models,
    validator,
    subscriptions,
    detailGenerator,
    models.dhisSyncQueue,
    sideEffectHandler,
    SYNC_QUEUE_KEY,
  );
}
