import { SyncFact } from '@tupaia/constants';
import { REQUIRED_DATA_VERSION } from '../constants';
import type { DatatrakWebModelRegistry } from '../types';
import { getSyncTick } from './getSyncTick';

export const getStoredDataVersion = async (models: DatatrakWebModelRegistry): Promise<number> => {
  const raw = await models.localSystemFact.get(SyncFact.DATA_VERSION);
  return raw ? Number.parseInt(raw, 10) : 0;
};

export const stampDataVersion = async (models: DatatrakWebModelRegistry): Promise<void> => {
  await models.localSystemFact.set(SyncFact.DATA_VERSION, REQUIRED_DATA_VERSION.toString());
};

// 'reset' = existing synced data on an older version → wipe + full re-pull.
// 'stamp' = fresh install (pull cursor -1) → clean pull happens anyway, just record the version.
// 'none'  = already up to date.
export const getDataVersionAction = async (
  models: DatatrakWebModelRegistry,
): Promise<'reset' | 'stamp' | 'none'> => {
  const storedVersion = await getStoredDataVersion(models);
  if (storedVersion >= REQUIRED_DATA_VERSION) return 'none';
  const pullSince = await getSyncTick(models, SyncFact.LAST_SUCCESSFUL_SYNC_PULL);
  return pullSince === -1 ? 'stamp' : 'reset';
};
