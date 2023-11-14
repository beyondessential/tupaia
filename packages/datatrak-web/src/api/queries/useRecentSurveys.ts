/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { useQuery } from 'react-query';
import { DatatrakWebRecentSurveysRequest, Project, UserAccount } from '@tupaia/types';
import { get } from '../api';
import { useCurrentUser } from '../CurrentUserContext';

export const useRecentSurveys = (userId?: UserAccount['id'], projectId?: Project['id']) => {
  return useQuery(
    ['recentSurveys', userId, projectId],
    (): Promise<DatatrakWebRecentSurveysRequest.ResBody> =>
      get('recentSurveys', { params: { userId, projectId } }),
    { enabled: !!userId && !!projectId },
  );
};

export const useCurrentUserRecentSurveys = () => {
  const { id, projectId } = useCurrentUser();
  return useRecentSurveys(id, projectId);
};
