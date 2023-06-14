/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useMutation, useQueryClient } from 'react-query';
import { useSearchParams } from 'react-router-dom';
import { post } from '../api';
import { PASSWORD_RESET_TOKEN_PARAM } from '../../constants';

type ResetPasswordParams = {
  oldPassword: string;
  newPassword: string;
  passwordConfirm: string;
};
export const useResetPassword = () => {
  const queryClient = useQueryClient();
  const [urlParams] = useSearchParams();
  const oneTimeLoginToken = urlParams.get(PASSWORD_RESET_TOKEN_PARAM);

  return useMutation<any, Error, ResetPasswordParams, unknown>(
    ({ oldPassword, newPassword, passwordConfirm }: ResetPasswordParams) => {
      return post('changePassword', {
        data: {
          oldPassword,
          newPassword,
          passwordConfirm,
          oneTimeLoginToken,
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
