/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 *
 */

import { useQuery } from 'react-query';
import { get } from '../api';
import { useValidatedQuery } from './useValidatedQuery';
import { SingleLandingPage } from '../../types';

export const useLandingPage = (urlSegment?: string) => {
  const landingPageResponse = useValidatedQuery(
    useQuery(['landingPage', urlSegment], () => get(`landingPage/${urlSegment}`, {}), {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
      enabled: !!urlSegment,
    }),
  );
  // handle default landing page value as empty object
  return {
    ...landingPageResponse,
    isLandingPage: !!landingPageResponse.data,
    landingPage: (landingPageResponse.data || {}) as SingleLandingPage,
  };
};
