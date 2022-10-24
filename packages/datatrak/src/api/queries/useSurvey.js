/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import { useQuery } from 'react-query';
import { get } from '../api';
import { useValidatedQuery } from './useValidatedQuery';

export const useSurvey = entityCode => {
  return useValidatedQuery(
    useQuery(['entity', entityCode], () => get(`entity/${entityCode}`), {
      staleTime: 1000 * 60 * 60 * 1,
      refetchOnWindowFocus: false,
      retry: 2,
    }),
  );
};
