/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { useMutation } from '@tanstack/react-query';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { post } from '../../VizBuilderApp/api';
import { PASSWORD_RESET_TOKEN_PARAM } from '../../authentication';

export const useResetPassword = (onError, onSettled, onSuccess) => {
  const [urlSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const oneTimeLoginToken = urlSearchParams.get(PASSWORD_RESET_TOKEN_PARAM);

  return useMutation(
    ({ oldPassword, newPassword, newPasswordConfirm }) => {
      return post('me/changePassword', {
        data: { oldPassword, newPassword, newPasswordConfirm, oneTimeLoginToken },
      });
    },
    {
      onError,
      onSettled,
      onSuccess: response => {
        // manually navigate to the removed token - using setUrlParams seems to remove the hash as well in this one case
        urlSearchParams.delete(PASSWORD_RESET_TOKEN_PARAM);
        navigate({
          ...location,
          search: urlSearchParams.toString(),
        });

        if (onSuccess) onSuccess(response);
      },
    },
  );
};
