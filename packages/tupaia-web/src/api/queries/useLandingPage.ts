/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 *
 */

import { useQuery } from 'react-query';
import { get } from '../api';
import { SingleLandingPage } from '../../types';

export const useLandingPage = (urlSegment?: string) => {
  const landingPageResponse = useQuery(
    ['landingPage', urlSegment],
    () => get(`landingPage/${urlSegment}`, {}),
    {
      enabled: !!urlSegment,
    },
  );
  // handle default landing page value as empty object
  return {
    ...landingPageResponse,
    isLandingPage: !!landingPageResponse.data,
    landingPage: (landingPageResponse.data || {}) as SingleLandingPage,
  };
};
