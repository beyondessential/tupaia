// useQueryWithContext.ts
import {
  QueryFunction,
  QueryFunctionContext,
  QueryKey,
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';

import { AccessPolicy } from '@tupaia/access-policy';
import { ensure } from '@tupaia/tsutils';
import { useDatabaseContext } from '../../hooks/database';
import { DatatrakWebModelRegistry } from '../../types';
import { CurrentUser, useCurrentUserContext } from '../CurrentUserContext';
import { useIsOfflineFirst } from '../offlineFirst';

// Define global context shape
interface GlobalQueryContext {
  models: DatatrakWebModelRegistry;
  accessPolicy: AccessPolicy;
  user: CurrentUser;
}

interface LocalQueryContext {
  readonly [key: string]: unknown;
}

export interface ContextualQueryFunctionContext
  extends QueryFunctionContext,
    GlobalQueryContext,
    LocalQueryContext {}

// Enhanced QueryFunction type that receives extra context
interface ContextualQueryFn<TData = unknown> {
  (context: ContextualQueryFunctionContext): TData | Promise<TData>;
}

// Main function with same signature as useQuery
export function useDatabaseQuery<
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
  TLocalContext extends LocalQueryContext = {},
>(
  queryKey: TQueryKey,
  queryFn: ContextualQueryFn<TQueryFnData>,
  options: UseQueryOptions<TQueryFnData, TError, TData, TQueryKey> & {
    localContext?: TLocalContext;
  } = {},
): UseQueryResult<TData, TError> {
  const { models } = useDatabaseContext() || {}; // safely call hooks
  const { accessPolicy, ...user } = useCurrentUserContext();
  const isOfflineFirst = useIsOfflineFirst();

  // Wrap the queryFn to include context
  const wrappedQueryFn: QueryFunction<TQueryFnData, TQueryKey> = queryFnContext =>
    queryFn({
      ...queryFnContext,
      accessPolicy: ensure(accessPolicy), // useQuery disabled if accessPolicy is pending
      models: isOfflineFirst ? ensure(models) : models!, // we will not use models if this is not offlineFirst
      user,
      ...options.localContext,
    });

  // Remove localContext from options before passing to useQuery
  const { localContext: _, enabled = true, ...queryOptions } = options;

  return useQuery<TQueryFnData, TError, TData, TQueryKey>({
    queryKey,
    queryFn: wrappedQueryFn,
    enabled: Boolean(accessPolicy) && enabled,
    ...queryOptions,
  });
}
