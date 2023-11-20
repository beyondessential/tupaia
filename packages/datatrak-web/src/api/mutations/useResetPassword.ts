/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useMutation } from 'react-query';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { post } from '../api';
import { PASSWORD_RESET_TOKEN_PARAM } from '../../constants';

type ResetPasswordParams = {
  oldPassword: string;
  newPassword: string;
  passwordConfirm: string;
};

export const useResetPassword = () => {
  const [urlSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const oneTimeLoginToken = urlSearchParams.get(PASSWORD_RESET_TOKEN_PARAM);

  return useMutation<any, Error, ResetPasswordParams, unknown>(
    ({ oldPassword, newPassword, passwordConfirm }: ResetPasswordParams) => {
      return post('me/changePassword', {
        data: {
          oldPassword,
          newPassword,
          passwordConfirm,
          oneTimeLoginToken,
        },
      });
    },
    {
      onSuccess: () => {
        // manually navigate to the removed token - using setUrlParams seems to remove the hash as well in this one case
        urlSearchParams.delete(PASSWORD_RESET_TOKEN_PARAM);
        navigate({
          ...location,
          search: urlSearchParams.toString(),
        });
      },
      meta: {
        applyCustomErrorHandling: true,
      },
    },
  );
};
