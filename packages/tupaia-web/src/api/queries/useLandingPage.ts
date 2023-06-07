/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 *
 */

import { useQuery } from 'react-query';
import { get } from '../api';
import { useValidatedQuery } from './useValidatedQuery';

export const useLandingPage = (urlSegment: string) => {
  return useValidatedQuery(
    useQuery(['landingPage', urlSegment], () => get(`landingPage/${urlSegment}`, {}), {
      staleTime: 1000 * 60 * 60 * 1,
      refetchOnWindowFocus: false,
    }),
  );
};
