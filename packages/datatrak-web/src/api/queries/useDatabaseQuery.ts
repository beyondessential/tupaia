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
type GlobalQueryContext = {
  models: DatatrakWebModelRegistry;
  accessPolicy?: AccessPolicy;
  user?: CurrentUser;
};

type LocalContext = Record<string, unknown>;

// Enhanced QueryFunction type that receives extra context
type ContextualQueryFn<TData> = (
  context: QueryFunctionContext & GlobalQueryContext & LocalContext,
) => Promise<TData>;

// Main function with same signature as useQuery
export function useDatabaseQuery<
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
  TLocalContext extends LocalContext = LocalContext,
>(
  queryKey: TQueryKey,
  queryFn: ContextualQueryFn<TQueryFnData>,
  options: UseQueryOptions<TQueryFnData, TError, TData, TQueryKey> & {
    localContext?: TLocalContext;
  },
): UseQueryResult<TData, TError> {
  const { models } = useDatabaseContext(); // safely call hooks
  const { accessPolicy, ...user } = useCurrentUserContext();

  // Wrap the queryFn to include context
  const wrappedQueryFn: QueryFunction<TQueryFnData, TQueryKey> = queryFnContext =>
    queryFn({ ...queryFnContext, models, accessPolicy, user, ...options?.localContext });

  // Remove localContext from options before passing to useQuery
  const { localContext: _omit, ...reactQueryOptions } = options ?? {};

  return useQuery<TQueryFnData, TError, TData, TQueryKey>({
    queryKey,
    queryFn: wrappedQueryFn,
    ...reactQueryOptions,
  });
}
