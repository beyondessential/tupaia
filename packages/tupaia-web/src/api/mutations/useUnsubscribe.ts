/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useMutation } from 'react-query';
import { TupaiaWebUnsubscribeRequest } from '@tupaia/types';
import { put } from '../api';

export const useUnsubscribe = (projectCode, entityCode, dashboardCode) => {
  return useMutation<any, Error, TupaiaWebUnsubscribeRequest.ReqBody, unknown>(
    ({ email }: TupaiaWebUnsubscribeRequest.ReqBody) => {
      return put(`unsubscribe/${projectCode}/${entityCode}/${dashboardCode}`, {
        data: {
          email,
          unsubscribeTime: new Date(),
        },
      });
    },
  );
};
