import { SyncFact } from '@tupaia/constants';
import { DatatrakWebModelRegistry } from '../types';

export const getSyncTick = async (models: DatatrakWebModelRegistry, fact: SyncFact) => {
  const syncTickFact = await models.localSystemFact.get(fact);
  return syncTickFact ? parseInt(syncTickFact, 10) : -1;
};
