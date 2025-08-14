import { stringifyQuery } from '@tupaia/utils';
import { useQuery, QueryClient } from '@tanstack/react-query';
import { get } from '../api';
import { DEFAULT_REACT_QUERY_OPTIONS } from '../constants';

const QUERY_KEY = ['transformSchema'];

const queryClient = new QueryClient();

const getTransformSchemas = async () => {
  const endpoint = stringifyQuery(undefined, 'fetchTransformSchemas', {});
  return get(endpoint);
};

export const prefetchTransformSchemas = async () => {
  await queryClient.prefetchQuery(QUERY_KEY, getTransformSchemas);
};

export const useSearchTransformSchemas = () =>
  useQuery(QUERY_KEY, getTransformSchemas, {
    ...DEFAULT_REACT_QUERY_OPTIONS,
    keepPreviousData: true,
  });
