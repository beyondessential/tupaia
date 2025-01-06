/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useMutation } from '@tanstack/react-query';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { post } from '../api';
import { URL_SEARCH_PARAMS } from '../../constants';

type ResetPasswordParams = {
  oldPassword: string;
  newPassword: string;
  passwordConfirm: string;
};
export const useResetPassword = () => {
  const [urlSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const oneTimeLoginToken = urlSearchParams.get(URL_SEARCH_PARAMS.PASSWORD_RESET_TOKEN);

  return useMutation<any, Error, ResetPasswordParams, unknown>(
    ({ oldPassword, newPassword, passwordConfirm }: ResetPasswordParams) => {
      return post('changePassword', {
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
        urlSearchParams.delete(URL_SEARCH_PARAMS.PASSWORD_RESET_TOKEN);
        navigate({
          ...location,
          search: urlSearchParams.toString(),
        });
      },
    },
  );
};
