/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useMutation } from 'react-query';
import { post } from '../api';

type ResetPasswordParams = {
  emailAddress: string;
};
export const useRequestResetPassword = () => {
  return useMutation<any, Error, ResetPasswordParams, unknown>(
    ({ emailAddress }: ResetPasswordParams) => {
      return post('auth/resetPassword', {
        data: {
          emailAddress,
          resetPasswordUrl: window.location.origin,
        },
      });
    },
    {
      meta: {
        applyCustomErrorHandling: true,
      },
    },
  );
};
