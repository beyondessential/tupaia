/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { useQuery } from 'react-query';
import { DatatrakWebTopSurveysRequest, Project, UserAccount } from '@tupaia/types';
import { get } from '../api';
import { useCurrentUser } from '../CurrentUserContext';

export const useTopSurveys = (userId?: UserAccount['id'], projectId?: Project['id']) => {
  return useQuery(
    ['topSurveys', userId, projectId],
    (): Promise<DatatrakWebTopSurveysRequest.ResBody> =>
      get('topSurveys', { params: { userId, projectId } }),
    { enabled: !!userId && !!projectId },
  );
};

export const useCurrentUserTopSurveys = () => {
  const { id, projectId } = useCurrentUser();
  return useTopSurveys(id, projectId);
};
