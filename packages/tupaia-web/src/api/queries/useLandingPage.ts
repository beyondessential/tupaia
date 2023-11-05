/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 *
 */

import { useQuery } from 'react-query';
import { useLocation } from 'react-router';
import { get } from '../api';
import { SingleLandingPage } from '../../types';

export const useLandingPage = (urlSegment?: string) => {
  const { pathname } = useLocation();
  // occasionally the urlSegment is not passed in, so we need to get it from the pathname. This is in cases where this hook is accessed from a modal, for example, that doesn't have access to the urlSegment param
  const landingPageUrlSegment = urlSegment || pathname.split('/')[1];
  const landingPageResponse = useQuery(
    ['landingPage', landingPageUrlSegment],
    () => get(`landingPage/${landingPageUrlSegment}`, {}),
    {
      enabled: !!landingPageUrlSegment,
    },
  );
  // handle default landing page value as empty object
  return {
    ...landingPageResponse,
    landingPageUrlSegment,
    isLandingPage: !!landingPageResponse.data,
    landingPage: (landingPageResponse.data || {}) as SingleLandingPage,
  };
};
