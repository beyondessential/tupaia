import { QueryKey, UseQueryOptions, UseQueryResult, useQuery } from 'react-query';

export const useCancellableQuery = (
  queryKey: QueryKey,
  queryFn: (signal: any) => any,
  options?: UseQueryOptions,
) => {
  const controller = new AbortController();
  const { signal } = controller;
  const result = useQuery(queryKey, () => queryFn({ signal }), {
    ...options,
  });
  return {
    ...result,
    cancel: () => controller.abort(),
  } as UseQueryResult & {
    cancel: () => void;
  };
};
