/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import { useQuery } from '@tanstack/react-query';
import { get } from '../api';
import { useValidatedQuery } from './useValidatedQuery';

export const useEntityData = entityCode => {
  return useValidatedQuery(
    useQuery(['entity', entityCode], () => get(`entity/${entityCode}`), {
      staleTime: 1000 * 60 * 60 * 1,
      refetchOnWindowFocus: false,
      retry: 2,
    }),
  );
};
