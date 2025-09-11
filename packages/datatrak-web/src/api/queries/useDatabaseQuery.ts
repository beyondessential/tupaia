// useQueryWithContext.ts
import {
  useQuery,
  QueryFunction,
  UseQueryOptions,
  UseQueryResult,
  QueryFunctionContext,
  QueryKey,
} from '@tanstack/react-query';
import { AccessPolicy } from '@tupaia/access-policy';

import { useDatabaseContext } from '../../hooks/database';
import { DatatrakWebModelRegistry } from '../../types';
import { CurrentUser, useCurrentUserContext } from '../CurrentUserContext';

// Define global context shape
interface GlobalQueryContext {
  models: DatatrakWebModelRegistry;
  accessPolicy: AccessPolicy;
  user: CurrentUser;
}

interface LocalContext {
  readonly [key: string]: unknown;
}

export interface ContextualQueryFunctionContext
  extends QueryFunctionContext,
    GlobalQueryContext,
    LocalContext {}

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
  TLocalContext extends LocalContext = {},
>(
  queryKey: TQueryKey,
  queryFn: ContextualQueryFn<TQueryFnData>,
  options: UseQueryOptions<TQueryFnData, TError, TData, TQueryKey> & {
    localContext?: TLocalContext;
  } = {},
): UseQueryResult<TData, TError> {
  const { models } = useDatabaseContext(); // safely call hooks
  const { accessPolicy, ...user } = useCurrentUserContext();

  // This should never happen, but just in case
  if (!accessPolicy) {
    throw new Error('Access policy is required');
  }

  // Wrap the queryFn to include context
  const wrappedQueryFn: QueryFunction<TQueryFnData, TQueryKey> = queryFnContext =>
    queryFn({ ...queryFnContext, models, accessPolicy, user, ...options.localContext });

  // Remove localContext from options before passing to useQuery
  const { localContext: _, ...queryOptions } = options;

  return useQuery<TQueryFnData, TError, TData, TQueryKey>({
    queryKey,
    queryFn: wrappedQueryFn,
    ...queryOptions,
  });
}
