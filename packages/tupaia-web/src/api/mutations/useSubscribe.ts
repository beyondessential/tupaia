/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useMutation } from 'react-query';
import { post } from '../api';
import { TupaiaWebSubscribeRequest } from '@tupaia/types'

export const useSubscribe = (projectCode, entityCode, dashboardCode) => {
  return useMutation<any, Error, TupaiaWebSubscribeRequest.ReqBody, unknown>(({
    email
  }: TupaiaWebSubscribeRequest.ReqBody) => {
    return post(`subscribe/${projectCode}/${entityCode}/${dashboardCode}`, { data: { email } });
  });
};
