import { DatatrakWebModelRegistry } from '../types';

export const getSyncTick = async (models: DatatrakWebModelRegistry, fact: string) => {
  const syncTickFact = await models.localSystemFact.get(fact);
  return syncTickFact ? parseInt(syncTickFact, 10) : -1;
};
