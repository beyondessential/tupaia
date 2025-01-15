import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router';
import { get } from '../api';
import { SingleLandingPage } from '../../types';

export const useLandingPage = () => {
  const { landingPageUrlSegment } = useParams();

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
