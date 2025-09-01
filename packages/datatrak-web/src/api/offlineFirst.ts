import { isWebApp } from '../utils';

/**
 * Returns `true` if and only if queries should be made to the local database (delegating to sync
 * for persisting data to the remote database). Returns `undefined` if the result is pending.
 */
export function useIsOfflineFirst(): boolean | undefined {
  return isWebApp();
}
