import { useMutation } from '@tanstack/react-query';
import { TupaiaWebUnsubscribeDashboardRequest } from '@tupaia/types';
import { put } from '../api';

export const useUnsubscribeDashboard = (projectCode, entityCode, dashboardCode) => {
  return useMutation<any, Error, TupaiaWebUnsubscribeDashboardRequest.ReqBody, unknown>(
    ({ email }: TupaiaWebUnsubscribeDashboardRequest.ReqBody) => {
      return put(`dashboard/${projectCode}/${entityCode}/${dashboardCode}/unsubscribe`, {
        data: {
          email,
          unsubscribeTime: new Date(),
        },
      });
    },
  );
};
