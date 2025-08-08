import { useMutation } from '@tanstack/react-query';
import { TupaiaWebUnsubscribeDashboardMailingListRequest } from '@tupaia/types';
import { put } from '../api';

type Args = TupaiaWebUnsubscribeDashboardMailingListRequest.Query &
  TupaiaWebUnsubscribeDashboardMailingListRequest.Params;

export const useUnsubscribeDashboardMailingList = () => {
  return useMutation<any, Error, Args, unknown>(({ email, token, mailingListId }: Args) => {
    return put(`dashboardMailingList/${mailingListId}/unsubscribe`, {
      params: {
        email,
        token,
      },
    });
  });
};
