/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { useQuery } from 'react-query';
import { DatatrakWebSubmissionHistoryRequest, UserAccount, Project } from '@tupaia/types';
import { useCurrentUser } from '../CurrentUserContext';
import { get } from '../api';

export const useSubmissionHistory = (userId?: UserAccount['id'], projectId?: Project['id']) => {
  return useQuery(
    ['submissionHistory', userId, projectId],
    (): Promise<DatatrakWebSubmissionHistoryRequest.ResBody> =>
      get('submissionHistory', { params: { userId, projectId } }),
    { enabled: !!userId && !!projectId },
  );
};

export const useCurrentUserSubmissionHistory = () => {
  const user = useCurrentUser();
  return useSubmissionHistory(user.id, user.projectId);
};
