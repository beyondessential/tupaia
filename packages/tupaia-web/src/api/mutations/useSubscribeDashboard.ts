/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useMutation } from '@tanstack/react-query';
import { TupaiaWebSubscribeDashboardRequest } from '@tupaia/types';
import { post } from '../api';

export const useSubscribeDashboard = (projectCode, entityCode, dashboardCode) => {
  return useMutation<any, Error, TupaiaWebSubscribeDashboardRequest.ReqBody, unknown>(
    ({ email }: TupaiaWebSubscribeDashboardRequest.ReqBody) => {
      return post(`dashboard/${projectCode}/${entityCode}/${dashboardCode}/subscribe`, {
        data: { email },
      });
    },
  );
};
