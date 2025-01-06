/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useMutation } from '@tanstack/react-query';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { post } from '../api';
import { PASSWORD_RESET_TOKEN_PARAM } from '../../constants';

export interface ResetPasswordParams {
  oldPassword: string;
  newPassword: string;
  newPasswordConfirm: string;
}

interface ResBody {
  message: string;
}

export const useResetPassword = (options?: {
  onError?: (error: Error) => void;
  onSettled?: () => void;
  onSuccess?: (response: ResBody) => void;
}) => {
  const [urlSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const oneTimeLoginToken = urlSearchParams.get(PASSWORD_RESET_TOKEN_PARAM);

  return useMutation<any, Error, ResetPasswordParams, unknown>(
    ({ oldPassword, newPassword, newPasswordConfirm }: ResetPasswordParams) => {
      return post('me/changePassword', {
        data: { oldPassword, newPassword, newPasswordConfirm, oneTimeLoginToken },
      });
    },
    {
      onError: (error: Error) => {
        if (options?.onError) options.onError(error);
      },
      onSettled: () => {
        if (options?.onSettled) options.onSettled();
      },
      onSuccess: (response: ResBody) => {
        // manually navigate to the removed token - using setUrlParams seems to remove the hash as well in this one case
        urlSearchParams.delete(PASSWORD_RESET_TOKEN_PARAM);
        navigate({
          ...location,
          search: urlSearchParams.toString(),
        });

        if (options?.onSuccess) options.onSuccess(response);
      },
      meta: {
        applyCustomErrorHandling: true,
      },
    },
  );
};
