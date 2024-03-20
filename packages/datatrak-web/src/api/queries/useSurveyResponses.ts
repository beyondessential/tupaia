/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { useQuery } from 'react-query';
import { DatatrakWebSurveyResponsesRequest, UserAccount, Project } from '@tupaia/types';
import { useCurrentUserContext } from '../CurrentUserContext';
import { get } from '../api';

export const useSurveyResponses = (userId?: UserAccount['id'], projectId?: Project['id']) => {
  return useQuery(
    ['surveyResponses', userId, projectId],
    (): Promise<DatatrakWebSurveyResponsesRequest.ResBody> =>
      get('surveyResponses', { params: { userId, projectId } }),
    { enabled: !!userId && !!projectId },
  );
};

export const useCurrentUserSurveyResponses = () => {
  const user = useCurrentUserContext();
  return useSurveyResponses(user.id, user.projectId);
};
