/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useMutation } from 'react-query';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { post } from '../api';
import { PASSWORD_RESET_TOKEN_PARAM } from '../../constants';

export type ResetPasswordParams = {
  oldPassword: string;
  newPassword: string;
  newPasswordConfirm: string;
};

export const useResetPassword = (options?: {
  onError?: () => void;
  onSettled?: () => void;
  onSuccess?: () => void;
}) => {
  const [urlSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const oneTimeLoginToken = urlSearchParams.get(PASSWORD_RESET_TOKEN_PARAM);

  return useMutation<any, Error, ResetPasswordParams, unknown>(
    (resetPasswordParams: ResetPasswordParams) => {
      return post('me/changePassword', {
        data: { ...resetPasswordParams, oneTimeLoginToken },
      });
    },
    {
      onError: () => {
        if (options?.onError) options.onError();
      },
      onSettled: () => {
        if (options?.onSettled) options.onSettled();
      },
      onSuccess: () => {
        // manually navigate to the removed token - using setUrlParams seems to remove the hash as well in this one case
        urlSearchParams.delete(PASSWORD_RESET_TOKEN_PARAM);
        navigate({
          ...location,
          search: urlSearchParams.toString(),
        });

        if (options?.onSuccess) options.onSuccess();
      },
      meta: {
        applyCustomErrorHandling: true,
      },
    },
  );
};
