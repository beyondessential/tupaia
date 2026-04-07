import type {
  QueryFunction,
  QueryKey,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';

export function useOnlineQuery<
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  queryKey: TQueryKey,
  queryFn: QueryFunction<TQueryFnData, TQueryKey>,
  options: Omit<
    UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
    'queryKey' | 'queryFn' | 'initialData'
  > = {},
): UseQueryResult<TData, TError> {
  const { enabled = true, ...rest } = options;
  return useQuery<TQueryFnData, TError, TData, TQueryKey>(queryKey, queryFn, {
    ...rest,
    enabled: window.navigator.onLine && enabled,
  });
}
