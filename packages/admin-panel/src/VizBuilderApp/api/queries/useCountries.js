import { useQuery } from '@tanstack/react-query';
import { get } from '../api';
import { DEFAULT_REACT_QUERY_OPTIONS } from '../constants';

export const useCountries = () =>
  useQuery(['countries'], async () => get(`countries`), {
    ...DEFAULT_REACT_QUERY_OPTIONS,
  });
