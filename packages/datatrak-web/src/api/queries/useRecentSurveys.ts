import { camelcaseKeys, ensure } from '@tupaia/tsutils';
import type { DatatrakWebRecentSurveysRequest, Project, UserAccount } from '@tupaia/types';
import { useCurrentUserContext } from '../CurrentUserContext';
import { get } from '../api';
import { useIsOfflineFirst } from '../offlineFirst';
import { useDatabaseQuery, type ContextualQueryFunctionContext } from './useDatabaseQuery';

interface RecentSurveysQueryContext extends ContextualQueryFunctionContext {
  projectId?: Project['id'];
  userId?: UserAccount['id'];
}

interface RecentSurveysQueryFunction {
  (context: RecentSurveysQueryContext): Promise<DatatrakWebRecentSurveysRequest.ResBody>;
}

const queryFunctions = {
  local: async ({ models, projectId, userId }) => {
    const surveyResponses = await models.user.getRecentSurveys(ensure(userId), projectId);
    return camelcaseKeys(surveyResponses);
  },
  remote: async ({ projectId, userId }) =>
    await get('recentSurveys', { params: { projectId, userId } }),
} as const satisfies Record<'local' | 'remote', RecentSurveysQueryFunction>;

export const useRecentSurveys = (userId?: UserAccount['id'], projectId?: Project['id']) => {
  const isOfflineFirst = useIsOfflineFirst();
  return useDatabaseQuery<DatatrakWebRecentSurveysRequest.ResBody>(
    ['recentSurveys', { userId, projectId }],
    isOfflineFirst ? queryFunctions.local : queryFunctions.remote,
    {
      enabled: Boolean(userId && projectId),
      localContext: { userId, projectId },
    },
  );
};

export const useCurrentUserRecentSurveys = () => {
  const { id, projectId } = useCurrentUserContext();
  return useRecentSurveys(id, projectId);
};
