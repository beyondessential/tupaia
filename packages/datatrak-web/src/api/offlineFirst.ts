import { getDataMode } from '../utils';

/**
 * Returns `true` if and only if queries should be made to the local database (delegating to sync
 * for persisting data to the remote database). Returns `undefined` if the result is pending.
 *
 * Today, we just decide based on the current display mode (as a heuristic for whether the app is
 * in a browser tab or web app). The signature of this hook reserves the `undefined`/pending return
 * value in case the result needs to be derived from an async data source.
 */
export function useIsOfflineFirst(): boolean | undefined {
  return getDataMode() === 'offlineFirst';
}
