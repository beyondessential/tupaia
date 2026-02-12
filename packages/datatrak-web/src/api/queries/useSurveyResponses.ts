import { useQuery } from '@tanstack/react-query';
import { DatatrakWebSurveyResponsesRequest, UserAccount, Project } from '@tupaia/types';
import { useCurrentUserContext } from '../CurrentUserContext';
import { get } from '../api';

export const useSurveyResponses = (userId?: UserAccount['id'], projectId?: Project['id']) => {
  const params = { userId, projectId };
  return useQuery<DatatrakWebSurveyResponsesRequest.ResBody>(
    ['surveyResponses', params],
    async () => await get('surveyResponses', { params }),
    { enabled: Boolean(userId && projectId) },
  );
};

export const useCurrentUserSurveyResponses = () => {
  const user = useCurrentUserContext();
  return useSurveyResponses(user.id, user.projectId);
};
