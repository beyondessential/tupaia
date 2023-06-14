/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useMutation, useQueryClient } from 'react-query';
import { post } from '../api';

type ResetPasswordParams = {
  emailAddress: string;
};
export const useRequestResetPassword = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, ResetPasswordParams, unknown>(
    ({ emailAddress }: ResetPasswordParams) => {
      return post('resetPassword', {
        data: {
          emailAddress,
          deviceName: window.navigator.userAgent,
        },
      });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries();
      },
    },
  );
};
