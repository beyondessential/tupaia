/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useMutation } from 'react-query';
import { TupaiaWebSubscribeRequest } from '@tupaia/types';
import { post } from '../api';

export const useSubscribe = (projectCode, entityCode, dashboardCode) => {
  return useMutation<any, Error, TupaiaWebSubscribeRequest.ReqBody, unknown>(
    ({ email }: TupaiaWebSubscribeRequest.ReqBody) => {
      return post(`dashboard/${projectCode}/${entityCode}/${dashboardCode}/subscribe`, {
        data: { email },
      });
    },
  );
};
