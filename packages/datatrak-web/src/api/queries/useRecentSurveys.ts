import { useQuery } from '@tanstack/react-query';
import { DatatrakWebRecentSurveysRequest, Project, UserAccount } from '@tupaia/types';
import { get } from '../api';
import { useCurrentUserContext } from '../CurrentUserContext';

export const useRecentSurveys = (userId?: UserAccount['id'], projectId?: Project['id']) => {
  return useQuery(
    ['recentSurveys', userId, projectId],
    (): Promise<DatatrakWebRecentSurveysRequest.ResBody> =>
      get('recentSurveys', { params: { userId, projectId } }),
    { enabled: !!userId && !!projectId },
  );
};

export const useCurrentUserRecentSurveys = () => {
  const { id, projectId } = useCurrentUserContext();
  return useRecentSurveys(id, projectId);
};
