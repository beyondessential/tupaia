import type { UseQueryResult } from '@tanstack/react-query';

import { getModelsForPush } from '@tupaia/sync';
import { hasOutgoingChanges } from '../../sync/hasOutgoingChanges';
import { useIsOfflineFirst } from '../offlineFirst';
import type { ContextualQueryFunctionContext } from './useDatabaseQuery';
import { useDatabaseQuery } from './useDatabaseQuery';

interface HasUnsyncedDataQueryFunctionContext extends ContextualQueryFunctionContext {}

const hasUnsyncedDataQueryFunctions = {
  local: async ({ models }: HasUnsyncedDataQueryFunctionContext) =>
    hasOutgoingChanges(getModelsForPush(models.getModels()), models.localSystemFact),
  remote: async (_context: HasUnsyncedDataQueryFunctionContext) => null,
};

/**
 * Result `data` is:
 * - `true` if there are unsynced changes;
 * - `false` if there are no unsynced changes;
 * - `undefined` if the result is pending;
 * - `null` if not applicable (i.e. not using sync).
 */
export function useHasUnsyncedDataQuery(): UseQueryResult<boolean | null> {
  const isOfflineFirst = useIsOfflineFirst();

  return useDatabaseQuery<boolean | null>(
    ['hasUnsyncedData'],
    isOfflineFirst ? hasUnsyncedDataQueryFunctions.local : hasUnsyncedDataQueryFunctions.remote,
    { localContext: {} },
  );
}
