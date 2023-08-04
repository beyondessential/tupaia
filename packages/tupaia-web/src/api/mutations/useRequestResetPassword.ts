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
      return post('resetPassword', {
        data: {
          emailAddress,
        },
      });
    },
  );
};
